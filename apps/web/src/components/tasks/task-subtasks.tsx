'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Plus } from 'lucide-react';
import { AvatarGroup } from '@/components/ui/avatar';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
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
import { InlineTaskInput } from './inline-task-input';
import { formatLongDate } from '@/lib/date';
import type { Task } from '@/lib/types';

export function TaskSubtasks({
  subtasks,
  onCreate,
  onDelete,
}: {
  subtasks: Task[];
  onCreate: (title: string) => void;
  onDelete: (task: Task) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <CollapsibleSection title="Subtasks" count={subtasks.length}>
      <TableCard>
        <Table>
          <TableHead>
            <Th className="w-full min-w-[180px]">Task</Th>
            <Th className="min-w-[110px]">Priority</Th>
            <Th className="min-w-[90px]">Members</Th>
            <Th className="min-w-[120px]">Due Date</Th>
            <Th align="right" className="min-w-[70px]">
              Actions
            </Th>
          </TableHead>

          <TableBody>
            {subtasks.map((subtask) => (
              <Tr key={subtask.id}>
                <Td>
                  <Link
                    href={`/tasks/${subtask.id}`}
                    className="text-ink hover:underline"
                  >
                    {subtask.title}
                  </Link>
                </Td>
                <Td>
                  <PriorityTag priority={subtask.priority} />
                </Td>
                <Td>
                  {subtask.assignees.length > 0 ? (
                    <AvatarGroup people={subtask.assignees} size="md" />
                  ) : (
                    <span className="text-ink-subtle">-</span>
                  )}
                </Td>
                <Td className="text-ink-muted">
                  {subtask.dueDate ? formatLongDate(subtask.dueDate) : '-'}
                </Td>
                <Td align="right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={`Actions for ${subtask.title}`}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${subtask.id}`}>Open</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-danger"
                        onSelect={() => onDelete(subtask)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Td>
              </Tr>
            ))}

            <Tr className="hover:bg-transparent">
              <Td colSpan={5} className="px-2">
                {adding ? (
                  <InlineTaskInput
                    placeholder="Subtask name, then press Enter"
                    onCancel={() => setAdding(false)}
                    onSubmit={(title) => {
                      onCreate(title);
                      setAdding(false);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subtasks
                  </button>
                )}
              </Td>
            </Tr>
          </TableBody>
        </Table>
      </TableCard>
    </CollapsibleSection>
  );
}
