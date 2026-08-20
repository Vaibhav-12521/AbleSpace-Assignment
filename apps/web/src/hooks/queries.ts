'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { api, type TaskFilters, type TaskInput } from '@/lib/api';
import type { Priority, Project, Task, TaskDetail, WorkspaceBootstrap } from '@/lib/types';

export const queryKeys = {
  bootstrap: ['bootstrap'] as const,
  tasks: (filters: TaskFilters) => ['tasks', filters] as const,
  task: (id: string) => ['task', id] as const,
  projects: (q?: string) => ['projects', q ?? ''] as const,
};

export function useBootstrap(
  options?: Partial<UseQueryOptions<WorkspaceBootstrap>>,
) {
  return useQuery({
    queryKey: queryKeys.bootstrap,
    queryFn: api.bootstrap,
    // Columns, labels and members change rarely; don't refetch on every mount.
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks(filters),
    queryFn: () => api.listTasks(filters),
    // Keeps the previous list on screen while a new filter query is in flight,
    // so typing in the search box doesn't flash an empty table.
    placeholderData: (previous) => previous,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.task(id),
    queryFn: () => api.getTask(id),
    enabled: Boolean(id),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id] as const,
    queryFn: () => api.getProject(id),
    enabled: Boolean(id),
  });
}

export function useProjects(q?: string) {
  return useQuery({
    queryKey: queryKeys.projects(q),
    queryFn: () => api.listProjects(q),
    placeholderData: (previous) => previous,
  });
}

/** Invalidates every task list regardless of which filters produced it. */
function invalidateTasks(client: ReturnType<typeof useQueryClient>) {
  return client.invalidateQueries({ queryKey: ['tasks'] });
}

export function useCreateTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => api.createTask(input),
    onSuccess: () => invalidateTasks(client),
  });
}

export function useUpdateTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) =>
      api.updateTask(id, input),
    onSuccess: (task) => {
      void invalidateTasks(client);
      void client.invalidateQueries({ queryKey: queryKeys.task(task.id) });
    },
  });
}

export function useDeleteTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => invalidateTasks(client),
  });
}

/**
 * Board drag-and-drop. Applies the move to every cached task list first so the
 * card stays where it was dropped instead of snapping back while the request
 * is in flight; the snapshot is restored if the server rejects it.
 */
export function useMoveTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statusId,
      position,
    }: {
      id: string;
      statusId: string;
      position: number;
    }) => api.moveTask(id, { statusId, position }),

    onMutate: async ({ id, statusId, position }) => {
      await client.cancelQueries({ queryKey: ['tasks'] });
      const snapshot = client.getQueriesData<Task[]>({ queryKey: ['tasks'] });

      for (const [key, tasks] of snapshot) {
        if (!tasks) continue;
        client.setQueryData<Task[]>(key, reorder(tasks, id, statusId, position));
      }

      return { snapshot };
    },

    onError: (_error, _variables, context) => {
      for (const [key, tasks] of context?.snapshot ?? []) {
        client.setQueryData(key, tasks);
      }
    },

    onSettled: () => invalidateTasks(client),
  });
}

/** Mirrors the server's reordering so the optimistic view matches the result. */
function reorder(
  tasks: Task[],
  id: string,
  statusId: string,
  position: number,
): Task[] {
  const moving = tasks.find((task) => task.id === id);
  if (!moving) return tasks;

  const rest = tasks.filter((task) => task.id !== id);
  const destination = rest
    .filter((task) => task.statusId === statusId)
    .sort((a, b) => a.position - b.position);

  destination.splice(position, 0, { ...moving, statusId, position });

  const renumbered = new Map(
    destination.map((task, index) => [task.id, index]),
  );

  return [
    ...rest.filter((task) => task.statusId !== statusId),
    ...destination.map((task) => ({
      ...task,
      statusId,
      position: renumbered.get(task.id) ?? task.position,
    })),
  ];
}

export function useCreateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      priority?: Priority;
      leadId?: string;
      dueDate?: string;
    }) => api.createProject(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Pick<Project, 'name' | 'priority'>> & {
        leadId?: string;
        dueDate?: string;
      };
    }) => api.updateProject(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useCreateComment(taskId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) =>
      api.createComment(taskId, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

export function useDeleteComment(taskId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteComment(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

export function useCreateResource(taskId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { url: string; label?: string }) =>
      api.createResource(taskId, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

export function useDeleteResource(taskId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteResource(id),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.task(taskId) }),
  });
}

export type { TaskDetail };
