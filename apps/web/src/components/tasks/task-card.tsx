'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DueDateBadge, LabelChip } from '@/components/ui/chip';
import { PriorityIcon } from '@/components/ui/priority';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';
import type { Task } from '@/lib/types';
import type { FieldKey } from '@/hooks/use-view-preferences';

export interface TaskCardProps {
  task: Task;
  fields: Record<FieldKey, boolean>;
  onDelete: (task: Task) => void;
  /** Applied to the drag preview so it reads as lifted off the board. */
  dragging?: boolean;
  className?: string;
}

/** Board card from screen 2: title, assignee, due date, label chips. */
export function TaskCard({
  task,
  fields,
  onDelete,
  dragging,
  className,
}: TaskCardProps) {
  const assignee = task.assignees[0];

  return (
    <article
      className={cn(
        'group rounded-lg border border-line bg-surface p-2.5',
        'shadow-[var(--shadow-card)] transition-shadow',
        dragging && 'rotate-1 shadow-[var(--shadow-popover)]',
        className,
      )}
    >
      <div className="flex items-start gap-1">
        <Link
          href={`/tasks/${task.id}`}
          className="flex-1 text-[13px] leading-snug font-medium text-ink hover:underline"
        >
          {task.title}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${task.title}`}
            // Revealed on hover, but always reachable by keyboard.
            className="-mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-ink-subtle opacity-0 transition-opacity hover:bg-surface-hover hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tasks/${task.id}`}>Open task</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger"
              onSelect={() => onDelete(task)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {(fields.members || fields.dueDate || fields.priority) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            {fields.priority && <PriorityIcon priority={task.priority} />}
            {fields.members && assignee && (
              <>
                <Avatar
                  name={assignee.name}
                  src={assignee.avatarUrl}
                  size="sm"
                />
                <span className="truncate text-[11px] text-ink-muted">
                  {assignee.name}
                </span>
              </>
            )}
          </span>

          {fields.dueDate && <DueDateBadge date={task.dueDate} />}
        </div>
      )}

      {fields.labels && task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 2).map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
          {task.labels.length > 2 && (
            <span className="self-center text-[11px] text-ink-subtle">
              +{task.labels.length - 2}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
