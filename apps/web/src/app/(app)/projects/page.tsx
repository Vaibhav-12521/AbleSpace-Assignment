'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
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
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { TaskToolbar } from '@/components/tasks/task-toolbar';
import { InlineTaskInput } from '@/components/tasks/inline-task-input';
import {
  PriorityIcon,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
} from '@/components/ui/priority';
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '@/hooks/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useViewPreferences } from '@/hooks/use-view-preferences';
import { formatLongDate } from '@/lib/date';
import type { Priority } from '@/lib/types';

/**
 * Projects screen from screens 9-11: a flat table with Priority, Lead and
 * Due Date, plus an inline row for adding a project.
 *
 * The Figma's primary button reads "Add Project" on screen 9 but "Add Task" on
 * screens 10 and 11. "Add Project" is used here since that is what the button
 * does; noted in the README.
 */
export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [adding, setAdding] = useState(false);

  const { mode, fields, setMode, toggleField } = useViewPreferences('projects');

  const projects = useProjects(debouncedSearch || undefined);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  return (
    <div className="flex min-h-full flex-col">
      <TaskToolbar
        title="Projects"
        search={search}
        onSearchChange={setSearch}
        mode={mode}
        onModeChange={setMode}
        fields={fields}
        onFieldChange={toggleField}
        addLabel="Add Project"
        // Projects only have the one layout in the design.
        showModeSwitch={false}
        onAdd={() => setAdding(true)}
      />

      {projects.isError ? (
        <ErrorState
          message="We couldn't load your projects."
          onRetry={() => void projects.refetch()}
        />
      ) : projects.isPending && !projects.data ? (
        <LoadingState label="Loading projects" />
      ) : debouncedSearch && (projects.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No matching projects"
          description={`Nothing matched “${debouncedSearch}”.`}
        />
      ) : (
        <div className="px-4 pb-10 sm:px-6">
          <TableCard>
            <Table>
              <TableHead>
                <Th className="w-full min-w-[220px]">Projects</Th>
                {fields.priority && <Th className="min-w-[110px]">Priority</Th>}
                {fields.members && <Th className="min-w-[90px]">Lead</Th>}
                {fields.dueDate && <Th className="min-w-[120px]">Due Date</Th>}
                <Th align="right" className="min-w-[70px]">
                  Actions
                </Th>
              </TableHead>

              <TableBody>
                {(projects.data ?? []).map((project) => (
                  <Tr key={project.id}>
                    <Td>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-ink hover:underline"
                      >
                        {project.name}
                      </Link>
                    </Td>

                    {fields.priority && (
                      <Td>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Priority for ${project.name}`}
                            className="rounded-md px-1 py-0.5 transition-colors hover:bg-surface-hover"
                          >
                            <PriorityTag priority={project.priority} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[160px]">
                            <DropdownMenuLabel>Priority</DropdownMenuLabel>
                            {PRIORITY_ORDER.map((priority: Priority) => (
                              <DropdownMenuRadioItem
                                key={priority}
                                checked={priority === project.priority}
                                onSelect={() =>
                                  updateProject.mutate({
                                    id: project.id,
                                    input: { priority },
                                  })
                                }
                              >
                                <PriorityIcon priority={priority} />
                                {PRIORITY_LABELS[priority]}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    )}

                    {fields.members && (
                      <Td>
                        {project.lead ? (
                          <Avatar
                            name={project.lead.name}
                            src={project.lead.avatarUrl}
                            size="md"
                          />
                        ) : (
                          <span className="text-ink-subtle">—</span>
                        )}
                      </Td>
                    )}

                    {fields.dueDate && (
                      <Td className="text-ink-muted">
                        {project.dueDate ? formatLongDate(project.dueDate) : '—'}
                      </Td>
                    )}

                    <Td align="right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${project.name}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>
                              Open project
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onSelect={() => deleteProject.mutate(project.id)}
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
                    {adding ? (
                      <InlineTaskInput
                        placeholder="Project name, then press Enter"
                        onCancel={() => setAdding(false)}
                        onSubmit={(name) => {
                          createProject.mutate({ name });
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
                        Add Projects
                      </button>
                    )}
                  </Td>
                </Tr>
              </TableBody>
            </Table>
          </TableCard>
        </div>
      )}
    </div>
  );
}

function countColumns(fields: Record<string, boolean>) {
  const optional = ['priority', 'members', 'dueDate'].filter(
    (key) => fields[key],
  ).length;
  return optional + 2;
}
