import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

/** Everything the board card and list row need, in one shape. */
const TASK_INCLUDE = {
  status: true,
  assignees: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
  labels: { include: { label: true } },
  teams: { include: { team: true } },
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { subtasks: true, comments: true } },
} satisfies Prisma.TaskInclude;

type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, query: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {
      // Scoping through status keeps every read inside the caller's workspace.
      status: { workspaceId },
      parentId: null,
    };

    if (query.projectId) where.projectId = query.projectId;
    if (query.statusIds?.length) where.statusId = { in: query.statusIds };
    if (query.priorities?.length) where.priority = { in: query.priorities };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.assigneeIds?.length) {
      where.assignees = { some: { userId: { in: query.assigneeIds } } };
    }
    if (query.labelIds?.length) {
      where.labels = { some: { labelId: { in: query.labelIds } } };
    }
    if (query.teamIds?.length) {
      where.teams = { some: { teamId: { in: query.teamIds } } };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
      orderBy: [{ status: { position: 'asc' } }, { position: 'asc' }],
    });

    return tasks.map(toTaskResponse);
  }

  async findOne(workspaceId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, status: { workspaceId } },
      include: {
        ...TASK_INCLUDE,
        resources: true,
        subtasks: {
          include: TASK_INCLUDE,
          orderBy: { position: 'asc' },
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (!task) throw new NotFoundException(`Task ${id} not found`);

    return {
      ...toTaskResponse(task),
      resources: task.resources,
      subtasks: task.subtasks.map(toTaskResponse),
      comments: task.comments,
      activities: task.activities,
    };
  }

  async create(workspaceId: string, userId: string, dto: CreateTaskDto) {
    await this.assertStatusInWorkspace(workspaceId, dto.statusId);
    if (dto.parentId) await this.assertTaskInWorkspace(workspaceId, dto.parentId);

    // Append to the end of the column unless a position was given.
    const position =
      dto.position ?? (await this.nextPosition(dto.statusId, dto.parentId));

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        statusId: dto.statusId,
        projectId: dto.projectId,
        parentId: dto.parentId,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position,
        reporterId: userId,
        assignees: dto.assigneeIds?.length
          ? { create: dto.assigneeIds.map((id) => ({ userId: id })) }
          : undefined,
        labels: dto.labelIds?.length
          ? { create: dto.labelIds.map((id) => ({ labelId: id })) }
          : undefined,
        teams: dto.teamIds?.length
          ? { create: dto.teamIds.map((id) => ({ teamId: id })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });

    await this.recordActivity(task.id, userId, 'created', 'created this task');

    return toTaskResponse(task);
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateTaskDto,
  ) {
    const existing = await this.assertTaskInWorkspace(workspaceId, id);
    if (dto.statusId) await this.assertStatusInWorkspace(workspaceId, dto.statusId);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        statusId: dto.statusId,
        projectId: dto.projectId,
        priority: dto.priority,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position: dto.position,
        // Relation arrays are treated as a full replacement, matching how the
        // UI edits them (a multi-select commits the whole set).
        assignees: dto.assigneeIds
          ? {
              deleteMany: {},
              create: dto.assigneeIds.map((uid) => ({ userId: uid })),
            }
          : undefined,
        labels: dto.labelIds
          ? {
              deleteMany: {},
              create: dto.labelIds.map((lid) => ({ labelId: lid })),
            }
          : undefined,
        teams: dto.teamIds
          ? {
              deleteMany: {},
              create: dto.teamIds.map((tid) => ({ teamId: tid })),
            }
          : undefined,
      },
      include: TASK_INCLUDE,
    });

    if (dto.priority && dto.priority !== existing.priority) {
      await this.recordActivity(
        id,
        userId,
        'priority',
        `changed priority from ${humanisePriority(existing.priority)} to ${humanisePriority(dto.priority)}`,
      );
    }
    if (dto.statusId && dto.statusId !== existing.statusId) {
      await this.recordActivity(id, userId, 'status', `moved this to ${task.status.name}`);
    }

    return toTaskResponse(task);
  }

  /**
   * Board drag-and-drop. Runs in a transaction so the sibling re-numbering and
   * the move itself cannot half-apply and leave two cards on one position.
   */
  async move(workspaceId: string, userId: string, id: string, dto: MoveTaskDto) {
    const task = await this.assertTaskInWorkspace(workspaceId, id);
    await this.assertStatusInWorkspace(workspaceId, dto.statusId);

    const movedWithinSameColumn = task.statusId === dto.statusId;

    await this.prisma.$transaction(async (tx) => {
      // Close the gap left behind in the source column.
      if (!movedWithinSameColumn) {
        await tx.task.updateMany({
          where: {
            statusId: task.statusId,
            parentId: task.parentId,
            position: { gt: task.position },
          },
          data: { position: { decrement: 1 } },
        });
      } else if (dto.position < task.position) {
        await tx.task.updateMany({
          where: {
            statusId: task.statusId,
            parentId: task.parentId,
            position: { gte: dto.position, lt: task.position },
          },
          data: { position: { increment: 1 } },
        });
      } else if (dto.position > task.position) {
        await tx.task.updateMany({
          where: {
            statusId: task.statusId,
            parentId: task.parentId,
            position: { gt: task.position, lte: dto.position },
          },
          data: { position: { decrement: 1 } },
        });
      }

      // Open a slot in the destination column.
      if (!movedWithinSameColumn) {
        await tx.task.updateMany({
          where: {
            statusId: dto.statusId,
            parentId: task.parentId,
            position: { gte: dto.position },
          },
          data: { position: { increment: 1 } },
        });
      }

      await tx.task.update({
        where: { id },
        data: { statusId: dto.statusId, position: dto.position },
      });
    });

    if (!movedWithinSameColumn) {
      const status = await this.prisma.status.findUnique({
        where: { id: dto.statusId },
      });
      await this.recordActivity(
        id,
        userId,
        'status',
        `moved this to ${status?.name ?? 'another column'}`,
      );
    }

    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const task = await this.assertTaskInWorkspace(workspaceId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id } });
      await tx.task.updateMany({
        where: {
          statusId: task.statusId,
          parentId: task.parentId,
          position: { gt: task.position },
        },
        data: { position: { decrement: 1 } },
      });
    });

    return { id };
  }

  private async nextPosition(statusId: string, parentId?: string | null) {
    const last = await this.prisma.task.findFirst({
      where: { statusId, parentId: parentId ?? null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return last ? last.position + 1 : 0;
  }

  private async assertTaskInWorkspace(workspaceId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, status: { workspaceId } },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  private async assertStatusInWorkspace(workspaceId: string, statusId: string) {
    const status = await this.prisma.status.findFirst({
      where: { id: statusId, workspaceId },
    });
    if (!status) {
      throw new BadRequestException(`Status ${statusId} does not exist here`);
    }
    return status;
  }

  private recordActivity(
    taskId: string,
    userId: string,
    type: string,
    message: string,
  ) {
    return this.prisma.activity.create({
      data: { taskId, userId, type, message },
    });
  }
}

/** Flattens Prisma's join rows into the shape the UI consumes. */
function toTaskResponse(task: TaskWithRelations) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    statusId: task.statusId,
    status: task.status,
    projectId: task.projectId,
    parentId: task.parentId,
    priority: task.priority,
    startDate: task.startDate,
    dueDate: task.dueDate,
    position: task.position,
    reporter: task.reporter,
    assignees: task.assignees.map((a) => a.user),
    labels: task.labels.map((l) => l.label),
    teams: task.teams.map((t) => t.team),
    subtaskCount: task._count.subtasks,
    commentCount: task._count.comments,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function humanisePriority(priority: string) {
  return priority === 'NO_PRIORITY'
    ? 'No priority'
    : priority.charAt(0) + priority.slice(1).toLowerCase();
}
