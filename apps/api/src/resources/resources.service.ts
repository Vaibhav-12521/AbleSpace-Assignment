import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, taskId: string, dto: CreateResourceDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, status: { workspaceId } },
      select: { id: true },
    });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    return this.prisma.resource.create({
      data: {
        taskId,
        url: dto.url,
        // Fall back to the URL's host so a link always has something readable.
        label: dto.label?.trim() || hostOf(dto.url),
      },
    });
  }

  async remove(workspaceId: string, id: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, task: { status: { workspaceId } } },
    });
    if (!resource) throw new NotFoundException(`Resource ${id} not found`);

    await this.prisma.resource.delete({ where: { id } });
    return { id };
  }
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
