'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { api, type TaskFilters, type TaskInput } from '@/lib/api';
import { pushToast } from '@/lib/toast';
import type {
  Priority,
  Project,
  Status,
  Task,
  TaskDetail,
  WorkspaceBootstrap,
} from '@/lib/types';

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

    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks(filters),
    queryFn: () => api.listTasks(filters),

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

function invalidateTasks(client: ReturnType<typeof useQueryClient>) {
  return client.invalidateQueries({ queryKey: ['tasks'] });
}

let optimisticSeq = 0;

function buildOptimisticTask(
  input: TaskInput,
  status: Status,
  position: number,
): Task {
  const now = new Date().toISOString();
  return {
    id: `optimistic-${++optimisticSeq}`,
    title: input.title,
    description: input.description ?? null,
    statusId: status.id,
    status,
    projectId: input.projectId ?? null,
    parentId: input.parentId ?? null,
    priority: input.priority ?? 'NO_PRIORITY',
    startDate: input.startDate ?? null,
    dueDate: input.dueDate ?? null,
    position,
    reporter: null,
    assignees: [],
    labels: [],
    teams: [],
    subtaskCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function useCreateTask() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: TaskInput) => api.createTask(input),

    onMutate: async (input) => {
      if (input.parentId) return { snapshot: [] as const };

      await client.cancelQueries({ queryKey: ['tasks'] });
      const snapshot = client.getQueriesData<Task[]>({ queryKey: ['tasks'] });
      const boot = client.getQueryData<WorkspaceBootstrap>(queryKeys.bootstrap);
      const status = boot?.statuses.find((s) => s.id === input.statusId);
      if (!status) return { snapshot };

      for (const [key, tasks] of snapshot) {
        if (!tasks) continue;
        const position = tasks.filter((t) => t.statusId === status.id).length;
        client.setQueryData<Task[]>(key, [
          ...tasks,
          buildOptimisticTask(input, status, position),
        ]);
      }

      return { snapshot };
    },

    onError: (_error, _input, context) => {
      for (const [key, tasks] of context?.snapshot ?? []) {
        client.setQueryData(key, tasks);
      }
    },

    onSettled: () => invalidateTasks(client),
  });
}

export function usePrefetchTask() {
  const client = useQueryClient();

  return (id: string) => {
    if (id.startsWith('optimistic-')) return;
    void client.prefetchQuery({
      queryKey: queryKeys.task(id),
      queryFn: () => api.getTask(id),
      staleTime: 30_000,
    });
  };
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
    onSuccess: () => {
      pushToast({ title: 'Task deleted', variant: 'success' });
      return invalidateTasks(client);
    },
  });
}

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
    onSuccess: () => {
      pushToast({ title: 'Project deleted', variant: 'success' });
      return client.invalidateQueries({ queryKey: ['projects'] });
    },
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
