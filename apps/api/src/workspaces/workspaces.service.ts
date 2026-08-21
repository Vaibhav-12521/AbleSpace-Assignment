import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStatusDto,
  UpdateProfileDto,
  UpdateStatusDto,
} from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBootstrap(workspaceId: string) {
    const [statuses, labels, teams, members] = await Promise.all([
      this.prisma.status.findMany({
        where: { workspaceId },
        orderBy: { position: 'asc' },
      }),
      this.prisma.label.findMany({
        where: { workspaceId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.team.findMany({
        where: { workspaceId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
    ]);

    return {
      statuses,
      labels,
      teams,
      members: members.map((m) => ({ ...m.user, role: m.role })),
    };
  }

  async createStatus(workspaceId: string, dto: CreateStatusDto) {
    const existing = await this.prisma.status.findUnique({
      where: { workspaceId_name: { workspaceId, name: dto.name } },
    });
    if (existing) {
      throw new BadRequestException(`A column named "${dto.name}" already exists`);
    }

    const last = await this.prisma.status.findFirst({
      where: { workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.status.create({
      data: {
        workspaceId,
        name: dto.name,
        color: dto.color,
        position: last ? last.position + 1 : 0,
      },
    });
  }

  async updateStatus(workspaceId: string, id: string, dto: UpdateStatusDto) {
    await this.assertStatus(workspaceId, id);
    return this.prisma.status.update({ where: { id }, data: dto });
  }

  async deleteStatus(workspaceId: string, id: string) {
    await this.assertStatus(workspaceId, id);

    const taskCount = await this.prisma.task.count({ where: { statusId: id } });
    if (taskCount > 0) {
      throw new BadRequestException(
        `Move or delete the ${taskCount} task(s) in this column first`,
      );
    }

    await this.prisma.status.delete({ where: { id } });
    return { id };
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        title: true,
        avatarUrl: true,
        isGuest: true,
      },
    });
  }

  private async assertStatus(workspaceId: string, id: string) {
    const status = await this.prisma.status.findFirst({
      where: { id, workspaceId },
    });
    if (!status) throw new NotFoundException(`Column ${id} not found`);
    return status;
  }
}
