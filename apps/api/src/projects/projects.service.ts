import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

const PROJECT_INCLUDE = {
  lead: { select: { id: true, name: true, email: true, avatarUrl: true } },
  _count: { select: { tasks: true } },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, q?: string) {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: PROJECT_INCLUDE,
      orderBy: { position: 'asc' },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(workspaceId: string, dto: CreateProjectDto) {
    const last = await this.prisma.project.findFirst({
      where: { workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.project.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        position: last ? last.position + 1 : 0,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(workspaceId, id);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        priority: dto.priority,
        leadId: dto.leadId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }
}
