'use client';

import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useViewPreferences } from '@/hooks/use-view-preferences';
import {
  useBootstrap,
  useCreateTask,
  useDeleteTask,
  useTasks,
} from '@/hooks/queries';
import { TaskToolbar } from '@/components/tasks/task-toolbar';
import { TaskListView } from '@/components/tasks/task-list-view';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  // Debounced so each keystroke doesn't fire its own request.
  const debouncedSearch = useDebouncedValue(search, 250);

  const { mode, fields, setMode, toggleField } = useViewPreferences('tasks');

  const bootstrap = useBootstrap();
  const filters = useMemo(
    () => (debouncedSearch ? { q: debouncedSearch } : {}),
    [debouncedSearch],
  );
  const tasks = useTasks(filters);

  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

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
