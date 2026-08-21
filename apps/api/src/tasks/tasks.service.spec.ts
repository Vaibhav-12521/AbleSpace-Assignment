import { Priority } from '@prisma/client';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const WORKSPACE = 'workspace-1';
const USER = 'user-1';
const TODO = 'status-todo';
const DOING = 'status-doing';

function buildService(task: { statusId: string; position: number }) {
  const tx = {
    task: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      update: jest.fn().mockResolvedValue({}),
    },
  };

  const stub = {
    id: 'task-1',
    title: 'Deploy to Production',
    description: null,
    statusId: task.statusId,
    projectId: null,
    parentId: null,
    priority: Priority.NO_PRIORITY,
    startDate: null,
    dueDate: null,
    position: task.position,
    reporter: null,
    status: {
      id: task.statusId,
      workspaceId: WORKSPACE,
      name: 'To Do',
      color: '#8b8b8b',
      position: 0,
    },
    assignees: [],
    labels: [],
    teams: [],
    _count: { subtasks: 0, comments: 0 },
    resources: [],
    subtasks: [],
    comments: [],
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    task: { findFirst: jest.fn().mockResolvedValue(stub) },
    status: {
      findFirst: jest.fn().mockResolvedValue({ id: DOING, workspaceId: WORKSPACE }),
      findUnique: jest.fn().mockResolvedValue({ id: DOING, name: 'Doing' }),
    },
    activity: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<void>) =>
      fn(tx),
    ),
  } as unknown as PrismaService;

  return { service: new TasksService(prisma), tx, prisma };
}

describe('TasksService.move', () => {
  it('shifts the cards in between down when a card moves up its column', async () => {
    const { service, tx } = buildService({ statusId: TODO, position: 3 });

    await service.move(WORKSPACE, USER, 'task-1', {
      statusId: TODO,
      position: 1,
    });

    expect(tx.task.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.task.updateMany).toHaveBeenCalledWith({
      where: {
        statusId: TODO,
        parentId: null,
        position: { gte: 1, lt: 3 },
      },
      data: { position: { increment: 1 } },
    });
    expect(tx.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { statusId: TODO, position: 1 },
    });
  });

  it('shifts the cards in between up when a card moves down its column', async () => {
    const { service, tx } = buildService({ statusId: TODO, position: 1 });

    await service.move(WORKSPACE, USER, 'task-1', {
      statusId: TODO,
      position: 3,
    });

    expect(tx.task.updateMany).toHaveBeenCalledWith({
      where: {
        statusId: TODO,
        parentId: null,
        position: { gt: 1, lte: 3 },
      },
      data: { position: { decrement: 1 } },
    });
  });

  it('closes the gap in the old column and opens one in the new', async () => {
    const { service, tx } = buildService({ statusId: TODO, position: 1 });

    await service.move(WORKSPACE, USER, 'task-1', {
      statusId: DOING,
      position: 0,
    });

    expect(tx.task.updateMany).toHaveBeenCalledWith({
      where: { statusId: TODO, parentId: null, position: { gt: 1 } },
      data: { position: { decrement: 1 } },
    });

    expect(tx.task.updateMany).toHaveBeenCalledWith({
      where: { statusId: DOING, parentId: null, position: { gte: 0 } },
      data: { position: { increment: 1 } },
    });

    expect(tx.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { statusId: DOING, position: 0 },
    });
  });

  it('records an activity entry only when the column changes', async () => {
    const moved = buildService({ statusId: TODO, position: 0 });
    await moved.service.move(WORKSPACE, USER, 'task-1', {
      statusId: DOING,
      position: 0,
    });
    expect(moved.prisma.activity.create).toHaveBeenCalled();

    const reordered = buildService({ statusId: TODO, position: 0 });
    await reordered.service.move(WORKSPACE, USER, 'task-1', {
      statusId: TODO,
      position: 2,
    });
    expect(reordered.prisma.activity.create).not.toHaveBeenCalled();
  });

  it('runs every write inside one transaction', async () => {
    const { service, prisma } = buildService({ statusId: TODO, position: 0 });

    await service.move(WORKSPACE, USER, 'task-1', {
      statusId: DOING,
      position: 1,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
