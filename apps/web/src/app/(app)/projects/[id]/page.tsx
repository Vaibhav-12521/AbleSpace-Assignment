'use client';

import { useParams } from 'next/navigation';
import { useBreadcrumbs } from '@/components/shell/app-shell';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { useProject } from '@/hooks/queries';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const project = useProject(projectId);

  useBreadcrumbs([
    { label: 'Projects', href: '/projects' },
    { label: project.data?.name ?? '...' },
  ]);

  return (
    <TaskWorkspace
      title="Tasks"
      projectId={projectId}
      preferenceScope={`project:${projectId}`}
    />
  );
}
