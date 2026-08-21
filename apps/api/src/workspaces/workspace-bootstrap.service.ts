import { Injectable } from '@nestjs/common';
import { Priority } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STATUSES = [
  { name: 'To Do', color: '#8b8b8b' },
  { name: 'Doing', color: '#3b82f6' },
  { name: 'Completed', color: '#10b981' },
  { name: 'On Hold', color: '#f59e0b' },
];

const LABELS = [
  { name: 'Research', color: '#8b5cf6' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Development', color: '#3b82f6' },
  { name: 'Testing', color: '#f59e0b' },
  { name: 'Deployment', color: '#10b981' },
  { name: 'Audit', color: '#ef4444' },
  { name: 'Scheduled', color: '#6366f1' },
  { name: 'Updated', color: '#14b8a6' },
  { name: 'Passed', color: '#22c55e' },
  { name: 'Review', color: '#a855f7' },
  { name: 'Optimization', color: '#f97316' },
];

const TEAMS = ['Engineering', 'Design', 'QA'];

const SEED_TASKS: Array<{
  status: string;
  title: string;
  description?: string;
  priority: Priority;
  labels: string[];
  dueInDays: number;
}> = [
  {
    status: 'To Do',
    title: 'Write API Documentation',
    description:
      'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
    priority: Priority.HIGH,
    labels: ['Research', 'Design', 'Development', 'Testing', 'Deployment'],
    dueInDays: 6,
  },
  {
    status: 'To Do',
    title: 'Implement Search Function',
    priority: Priority.MEDIUM,
    labels: ['Development', 'Deployment'],
    dueInDays: 6,
  },
  {
    status: 'To Do',
    title: 'Deploy to Production',
    priority: Priority.URGENT,
    labels: ['Deployment'],
    dueInDays: 6,
  },
  {
    status: 'Doing',
    title: 'Code Review Completed',
    priority: Priority.MEDIUM,
    labels: ['Development', 'Review'],
    dueInDays: 6,
  },
  {
    status: 'Doing',
    title: 'Design Mockups Finalized',
    priority: Priority.LOW,
    labels: ['Design'],
    dueInDays: 6,
  },
  {
    status: 'Completed',
    title: 'Feature Testing Passed',
    priority: Priority.MEDIUM,
    labels: ['Testing', 'Passed'],
    dueInDays: 7,
  },
  {
    status: 'Completed',
    title: 'UI Design Updated',
    priority: Priority.LOW,
    labels: ['Design', 'Updated'],
    dueInDays: 8,
  },
  {
    status: 'Completed',
    title: 'Security Audit Scheduled',
    priority: Priority.HIGH,
    labels: ['Audit', 'Scheduled'],
    dueInDays: 9,
  },
  {
    status: 'On Hold',
    title: 'UI Review Pending',
    priority: Priority.MEDIUM,
    labels: ['Design', 'Review'],
    dueInDays: 10,
  },
  {
    status: 'On Hold',
    title: 'Backend Integration',
    priority: Priority.HIGH,
    labels: ['Development', 'Testing'],
    dueInDays: 11,
  },
  {
    status: 'On Hold',
    title: 'User Feedback Analysis',
    priority: Priority.LOW,
    labels: ['Research'],
    dueInDays: 12,
  },
  {
    status: 'On Hold',
    title: 'Performance Optimization',
    priority: Priority.URGENT,
    labels: ['Development', 'Optimization'],
    dueInDays: 13,
  },
];

const SEED_PROJECTS: Array<{ name: string; priority: Priority; dueInDays: number }> = [
  { name: 'Design Homepage', priority: Priority.HIGH, dueInDays: 23 },
  { name: 'Develop Login Feature', priority: Priority.LOW, dueInDays: 26 },
  { name: 'Test Payment Gateway', priority: Priority.MEDIUM, dueInDays: 29 },
];

@Injectable()
export class WorkspaceBootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  async createStarterWorkspace(userId: string, workspaceName: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: workspaceName,
        members: { create: { userId, role: 'owner' } },
        statuses: {
          create: STATUSES.map((s, i) => ({ ...s, position: i })),
        },
        labels: { create: LABELS },
        teams: { create: TEAMS.map((name) => ({ name })) },
      },
      include: { statuses: true, labels: true },
    });

    const statusByName = new Map(workspace.statuses.map((s) => [s.name, s.id]));
    const labelByName = new Map(workspace.labels.map((l) => [l.name, l.id]));

    const project = await this.prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: SEED_PROJECTS[0].name,
        priority: SEED_PROJECTS[0].priority,
        leadId: userId,
        dueDate: daysFromNow(SEED_PROJECTS[0].dueInDays),
        position: 0,
      },
    });

    await this.prisma.project.createMany({
      data: SEED_PROJECTS.slice(1).map((p, i) => ({
        workspaceId: workspace.id,
        name: p.name,
        priority: p.priority,
        leadId: userId,
        dueDate: daysFromNow(p.dueInDays),
        position: i + 1,
      })),
    });

    const positionByStatus = new Map<string, number>();
    for (const seed of SEED_TASKS) {
      const statusId = statusByName.get(seed.status);
      if (!statusId) continue;

      const position = positionByStatus.get(statusId) ?? 0;
      positionByStatus.set(statusId, position + 1);

      await this.prisma.task.create({
        data: {
          projectId: project.id,
          statusId,
          title: seed.title,
          description: seed.description,
          priority: seed.priority,
          dueDate: daysFromNow(seed.dueInDays),
          position,
          reporterId: userId,
          assignees: { create: { userId } },
          labels: {
            create: seed.labels
              .map((name) => labelByName.get(name))
              .filter((id): id is string => Boolean(id))
              .map((labelId) => ({ labelId })),
          },
        },
      });
    }

    return workspace;
  }
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}
