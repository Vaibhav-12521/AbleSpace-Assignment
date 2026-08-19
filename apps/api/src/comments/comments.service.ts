import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

const AUTHOR_SELECT = { id: true, name: true, avatarUrl: true };

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    workspaceId: string,
    userId: string,
    taskId: string,
    dto: CreateCommentDto,
  ) {
    await this.assertTask(workspaceId, taskId);

    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, taskId },
      });
      if (!parent) {
        throw new BadRequestException('Cannot reply to a comment on another task');
      }
      // One level of nesting only, matching the design's reply thread.
      if (parent.parentId) {
        throw new BadRequestException('Replies cannot be nested further');
      }
    }

    const comment = await this.prisma.comment.create({
      data: { taskId, authorId: userId, body: dto.body, parentId: dto.parentId },
      include: { author: { select: AUTHOR_SELECT } },
    });

    await this.prisma.activity.create({
      data: {
        taskId,
        userId,
        type: 'comment',
        message: 'posted an update',
      },
    });

    return comment;
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.assertOwnComment(workspaceId, userId, id);
    return this.prisma.comment.update({
      where: { id: comment.id },
      data: { body: dto.body },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async remove(workspaceId: string, userId: string, id: string) {
    const comment = await this.assertOwnComment(workspaceId, userId, id);
    await this.prisma.comment.delete({ where: { id: comment.id } });
    return { id: comment.id };
  }

  private async assertTask(workspaceId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, status: { workspaceId } },
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);
    return task;
  }

  private async assertOwnComment(
    workspaceId: string,
    userId: string,
    id: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, task: { status: { workspaceId } } },
    });
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);
    if (comment.authorId !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }
    return comment;
  }
}
