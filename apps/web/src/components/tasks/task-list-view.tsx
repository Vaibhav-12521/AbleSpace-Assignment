'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Plus } from 'lucide-react';
import { AvatarGroup } from '@/components/ui/avatar';
import { LabelChip } from '@/components/ui/chip';
import { CollapsibleSection, StatusDot } from '@/components/ui/collapsible-section';
import { PriorityTag } from '@/components/ui/priority';
import {
  Table,
  TableBody,
  TableCard,
  TableHead,
  Td,
  Th,
  Tr,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskCard } from './task-card';
import { InlineTaskInput } from './inline-task-input';
import { formatLongDate } from '@/lib/date';
import type { Status, Task } from '@/lib/types';
import type { FieldKey } from '@/hooks/use-view-preferences';
import { usePrefetchTask } from '@/hooks/queries';

export interface TaskListViewProps {
  statuses: Status[];
  tasks: Task[];
  fields: Record<FieldKey, boolean>;
  onCreateTask: (statusId: string, title: string) => void;
  onDeleteTask: (task: Task) => void;
}

export function TaskListView({
  statuses,
  tasks,
  fields,
  onCreateTask,
  onDeleteTask,
}: TaskListViewProps) {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const prefetch = usePrefetchTask();

  return (
    <div className="space-y-5 px-4 pb-10 sm:px-6">
      {statuses.map((status) => {
        const rows = tasks
          .filter((task) => task.statusId === status.id)
          .sort((a, b) => a.position - b.position);

        return (
          <CollapsibleSection
            key={status.id}
            count={rows.length}
            title={
              <span className="flex items-center gap-1.5">
                {fields.status && <StatusDot color={status.color} />}
                {status.name}
              </span>
            }
          >

            <div className="space-y-2.5 sm:hidden">
              {rows.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  fields={fields}
                  onDelete={onDeleteTask}
                />
              ))}

              {addingTo === status.id ? (
                <InlineTaskInput
                  onCancel={() => setAddingTo(null)}
                  onSubmit={(title) => {
                    onCreateTask(status.id, title);
                    setAddingTo(null);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTo(status.id)}
                  className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[13px] text-ink-muted transition-colors hover:text-ink"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </button>
              )}
            </div>

            <TableCard className="hidden sm:block">
              <Table>
                <TableHead>
                  <Th className="w-full min-w-[220px]">Task</Th>
                  {fields.priority && <Th className="min-w-[110px]">Priority</Th>}
                  {fields.members && <Th className="min-w-[100px]">Members</Th>}
                  {fields.labels && <Th className="min-w-[140px]">Labels</Th>}
                  {fields.reporter && <Th className="min-w-[110px]">Reporter</Th>}
                  {fields.dueDate && <Th className="min-w-[120px]">Due Date</Th>}
                  <Th align="right" className="min-w-[70px]">
                    Actions
                  </Th>
                </TableHead>

                <TableBody>
                  {rows.map((task) => (
                    <Tr key={task.id} onMouseEnter={() => prefetch(task.id)}>
                      <Td>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-ink hover:underline"
                        >
                          {task.title}
                        </Link>
                      </Td>

                      {fields.priority && (
                        <Td>
                          <PriorityTag priority={task.priority} />
                        </Td>
                      )}

                      {fields.members && (
                        <Td>
                          {task.assignees.length > 0 ? (
                            <AvatarGroup people={task.assignees} size="md" />
                          ) : (
                            <span className="text-ink-subtle">-</span>
                          )}
                        </Td>
                      )}

                      {fields.labels && (
                        <Td>
                          <span className="flex flex-wrap gap-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <LabelChip key={label.id} label={label} />
                            ))}
                            {task.labels.length > 2 && (
                              <span className="text-[11px] text-ink-subtle">
                                +{task.labels.length - 2}
                              </span>
                            )}
                          </span>
                        </Td>
                      )}

                      {fields.reporter && (
                        <Td className="text-ink-muted">
                          {task.reporter?.name ?? '-'}
                        </Td>
                      )}

                      {fields.dueDate && (
                        <Td className="text-ink-muted">
                          {task.dueDate ? formatLongDate(task.dueDate) : '-'}
                        </Td>
                      )}

                      <Td align="right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${task.title}`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tasks/${task.id}`}>Open task</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-danger"
                              onSelect={() => onDeleteTask(task)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    </Tr>
                  ))}

                  <Tr className="hover:bg-transparent">
                    <Td colSpan={countColumns(fields)} className="px-2">
                      {addingTo === status.id ? (
                        <InlineTaskInput
                          onCancel={() => setAddingTo(null)}
                          onSubmit={(title) => {
                            onCreateTask(status.id, title);
                            setAddingTo(null);
                          }}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingTo(status.id)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Task
                        </button>
                      )}
                    </Td>
                  </Tr>
                </TableBody>
              </Table>
            </TableCard>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

function countColumns(fields: Record<FieldKey, boolean>) {
  const optional = (['priority', 'members', 'labels', 'reporter', 'dueDate'] as const)
    .filter((key) => fields[key]).length;
  return optional + 2;
}
