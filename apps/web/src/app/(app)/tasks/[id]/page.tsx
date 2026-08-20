'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Eye,
  Link2,
  Lock,
  MoreHorizontal,
  PanelRight,
  Plus,
  Share2,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useBreadcrumbs } from '@/components/shell/app-shell';
import { Avatar } from '@/components/ui/avatar';
import { DueDateBadge, LabelChip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { TaskDetailsPanel } from '@/components/tasks/task-details-panel';
import { TaskSubtasks } from '@/components/tasks/task-subtasks';
import { TaskComments, TaskUpdates } from '@/components/tasks/task-comments';
import {
  useBootstrap,
  useCreateComment,
  useCreateResource,
  useCreateTask,
  useDeleteComment,
  useDeleteResource,
  useDeleteTask,
  useTask,
  useUpdateTask,
} from '@/hooks/queries';
import { cn } from '@/lib/cn';

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;

  const { user } = useAuth();
  const bootstrap = useBootstrap();
  const task = useTask(taskId);

  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const createResource = useCreateResource(taskId);
  const deleteResource = useDeleteResource(taskId);

  const [railOpen, setRailOpen] = useState(true);

  useBreadcrumbs([
    { label: 'Tasks', href: '/tasks' },
    { label: task.data?.title ?? '…' },
  ]);

  if (task.isError) {
    return (
      <ErrorState
        message="We couldn't load this task."
        onRetry={() => void task.refetch()}
      />
    );
  }

  if (task.isPending || !task.data || !user) {
    return <LoadingState label="Loading task" />;
  }

  const detail = task.data;

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-5">
        <header className="space-y-2">
          <div className="flex items-start gap-2">
            {/* Title edits commit on blur, so there is no separate save button. */}
            <input
              defaultValue={detail.title}
              key={detail.id + detail.title}
              aria-label="Task title"
              onBlur={(event) => {
                const title = event.target.value.trim();
                if (title && title !== detail.title) {
                  updateTask.mutate({ id: detail.id, input: { title } });
                }
              }}
              className="min-w-0 flex-1 rounded-md bg-transparent text-[20px] font-semibold tracking-tight text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
            />

            <div className="flex shrink-0 items-center gap-1 text-ink-muted">
              <IconBadge title="Private task">
                <Lock className="h-3.5 w-3.5" />
              </IconBadge>
              <span className="inline-flex h-7 items-center gap-1 rounded-md border border-line px-2 text-[11px]">
                <Eye className="h-3.5 w-3.5" />1
              </span>
              <IconBadge title="Share">
                <Share2 className="h-3.5 w-3.5" />
              </IconBadge>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Task actions"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-danger"
                    onSelect={() => {
                      deleteTask.mutate(detail.id);
                      // Nothing left to show once the task is gone.
                      router.push('/tasks');
                    }}
                  >
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                aria-label={railOpen ? 'Hide details' : 'Show details'}
                aria-expanded={railOpen}
                onClick={() => setRailOpen((open) => !open)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line transition-colors hover:bg-surface-hover hover:text-ink"
              >
                <PanelRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <textarea
            defaultValue={detail.description ?? ''}
            key={`${detail.id}-description`}
            rows={2}
            placeholder="Add a description…"
            aria-label="Task description"
            onBlur={(event) => {
              const description = event.target.value.trim();
              if (description !== (detail.description ?? '')) {
                updateTask.mutate({ id: detail.id, input: { description } });
              }
            }}
            className="w-full resize-none rounded-md bg-transparent text-[13px] leading-relaxed text-ink-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
        </header>

        <dl className="space-y-2.5">
          <PropertyRow label="Properties">
            <span className="flex flex-wrap items-center gap-1.5">
              {detail.assignees.length > 0 ? (
                detail.assignees.map((person) => (
                  <span
                    key={person.id}
                    className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink-muted"
                  >
                    <Avatar name={person.name} src={person.avatarUrl} size="xs" />
                    {person.name}
                  </span>
                ))
              ) : (
                <span className="text-[12px] text-ink-subtle">Unassigned</span>
              )}
              <DueDateBadge date={detail.dueDate} />
            </span>
          </PropertyRow>

          <PropertyRow label="Labels">
            {detail.labels.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {detail.labels.map((label) => (
                  <LabelChip key={label.id} label={label} />
                ))}
              </span>
            ) : (
              <span className="text-[12px] text-ink-subtle">No labels</span>
            )}
          </PropertyRow>

          <PropertyRow label="Resources">
            <span className="flex flex-wrap items-center gap-1.5">
              {detail.resources.map((resource) => (
                <span
                  key={resource.id}
                  className="group inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px]"
                >
                  <Link2 className="h-2.5 w-2.5 text-ink-muted" />
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-ink hover:underline"
                  >
                    {resource.label}
                  </a>
                  <button
                    type="button"
                    aria-label={`Remove ${resource.label}`}
                    onClick={() => deleteResource.mutate(resource.id)}
                    className="text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}

              <AddResource
                onAdd={(url, label) => createResource.mutate({ url, label })}
                error={createResource.error?.message}
              />
            </span>
          </PropertyRow>
        </dl>

        <TaskSubtasks
          subtasks={detail.subtasks}
          onCreate={(title) =>
            createTask.mutate({
              title,
              statusId: detail.statusId,
              parentId: detail.id,
              projectId: detail.projectId ?? undefined,
            })
          }
          onDelete={(subtask) => deleteTask.mutate(subtask.id)}
        />

        <TaskComments
          comments={detail.comments}
          currentUser={user}
          onCreate={(input) => createComment.mutate(input)}
          onDelete={(id) => deleteComment.mutate(id)}
        />
      </div>

      <div className={cn('space-y-4 lg:w-[280px]', !railOpen && 'hidden')}>
        <TaskDetailsPanel
          task={detail}
          workspace={bootstrap.data}
          onPatch={(patch) => updateTask.mutate({ id: detail.id, input: patch })}
        />
        <TaskUpdates activities={detail.activities} />
      </div>

    </div>
  );
}

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <dt className="w-[70px] shrink-0 text-[12px] text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}

function IconBadge({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line"
    >
      {children}
    </span>
  );
}

/** "Add document or link…" affordance from the Resources row. */
function AddResource({
  onAdd,
  error,
}: {
  onAdd: (url: string, label?: string) => void;
  error?: string;
}) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[12px] text-ink-subtle transition-colors hover:text-ink-muted">
        <Plus className="h-3 w-3" />
        Add document or link…
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] space-y-2 p-3">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/spec"
          aria-label="Resource URL"
        />
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label (optional)"
          aria-label="Resource label"
        />
        {error && <p className="text-[11px] text-danger">{error}</p>}
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          disabled={!url.trim()}
          onClick={() => {
            onAdd(url.trim(), label.trim() || undefined);
            setUrl('');
            setLabel('');
          }}
        >
          Add resource
        </Button>
      </PopoverContent>
    </Popover>
  );
}
