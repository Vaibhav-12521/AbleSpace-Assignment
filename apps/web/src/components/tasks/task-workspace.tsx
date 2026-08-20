'use client';

import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useViewPreferences } from '@/hooks/use-view-preferences';
import {
  useBootstrap,
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useTasks,
} from '@/hooks/queries';
import { TaskToolbar } from './task-toolbar';
import { TaskListView } from './task-list-view';
import { TaskBoardView } from './task-board-view';
import { TaskFilterMenu } from './task-filter-menu';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import type { TaskFilters } from '@/lib/api';
import type { Task } from '@/lib/types';

export interface TaskWorkspaceProps {
  title: string;
  /** Scopes the query and new tasks to one project; omitted on /tasks. */
  projectId?: string;
  /** Persists view mode and column choices separately per screen. */
  preferenceScope: string;
}

/**
 * The Tasks screen, shared by /tasks and a project's own task list (screen 12).
 * Both render the same toolbar, board and list; only the scope differs, so the
 * whole thing lives here rather than being duplicated per route.
 */
export function TaskWorkspace({
  title,
  projectId,
  preferenceScope,
}: TaskWorkspaceProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { mode, fields, setMode, toggleField } =
    useViewPreferences(preferenceScope);

  const bootstrap = useBootstrap();

  const [facets, setFacets] = useState<TaskFilters>({});
  const filters = useMemo<TaskFilters>(
    () => ({ ...facets, projectId, q: debouncedSearch || undefined }),
    [facets, projectId, debouncedSearch],
  );
  const tasks = useTasks(filters);

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();

  const statuses = bootstrap.data?.statuses ?? [];

  function handleCreate(statusId: string, taskTitle: string) {
    createTask.mutate({ title: taskTitle, statusId, projectId });
  }

  function handleDelete(task: Task) {
    deleteTask.mutate(task.id);
  }

  const hasSearch = Boolean(debouncedSearch);
  const isFiltered = hasSearch || Object.keys(facets).length > 0;

  return (
    <div className="flex min-h-full flex-col">
      <TaskToolbar
        title={title}
        search={search}
        onSearchChange={setSearch}
        mode={mode}
        onModeChange={setMode}
        fields={fields}
        onFieldChange={toggleField}
        filterContent={
          <TaskFilterMenu
            filters={facets}
            onChange={setFacets}
            workspace={bootstrap.data}
          />
        }
        onAdd={() => {
          const first = statuses[0];
          if (first) handleCreate(first.id, 'New task');
        }}
      />

      {bootstrap.isError || tasks.isError ? (
        <ErrorState
          message="We couldn't load your tasks."
          onRetry={() => {
            void bootstrap.refetch();
            void tasks.refetch();
          }}
        />
      ) : bootstrap.isPending || (tasks.isPending && !tasks.data) ? (
        <LoadingState label="Loading tasks" />
      ) : statuses.length === 0 ? (
        <EmptyState
          title="No columns yet"
          description="Add a column to start tracking work."
        />
      ) : isFiltered && (tasks.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No matching tasks"
          description={
            hasSearch
              ? `Nothing matched “${debouncedSearch}”.`
              : 'No tasks match the current filters.'
          }
        />
      ) : mode === 'board' ? (
        <TaskBoardView
          statuses={statuses}
          tasks={tasks.data ?? []}
          fields={fields}
          onCreateTask={handleCreate}
          onDeleteTask={handleDelete}
          onMoveTask={(input) => moveTask.mutate(input)}
        />
      ) : (
        <TaskListView
          statuses={statuses}
          tasks={tasks.data ?? []}
          fields={fields}
          onCreateTask={handleCreate}
          onDeleteTask={handleDelete}
        />
      )}
    </div>
  );
}
