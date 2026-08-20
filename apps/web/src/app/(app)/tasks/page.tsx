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
import { TaskToolbar } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskBoardView } from '@/components/tasks/task-board-view';
import { TaskFilterMenu } from '@/components/tasks/task-filter-menu';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import type { TaskFilters } from '@/lib/api';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  // Debounced so each keystroke doesn't fire its own request.
  const debouncedSearch = useDebouncedValue(search, 250);

  const { mode, fields, setMode, toggleField } = useViewPreferences('tasks');

  const bootstrap = useBootstrap();

  // Facet filters live separately from the search box, then merge into one
  // query so the request (and the React Query cache key) reflects both.
  const [facets, setFacets] = useState<TaskFilters>({});
  const filters = useMemo<TaskFilters>(
    () => ({ ...facets, q: debouncedSearch || undefined }),
    [facets, debouncedSearch],
  );
  const tasks = useTasks(filters);

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const moveTask = useMoveTask();

  const statuses = bootstrap.data?.statuses ?? [];

  function handleCreate(statusId: string, title: string) {
    createTask.mutate({ title, statusId });
  }

  function handleDelete(task: Task) {
    deleteTask.mutate(task.id);
  }

  return (
    <div className="flex min-h-full flex-col">
      <TaskToolbar
        title="Tasks"
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
      ) : debouncedSearch && (tasks.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No matching tasks"
          description={`Nothing matched “${debouncedSearch}”.`}
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
