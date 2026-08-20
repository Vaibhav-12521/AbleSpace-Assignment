import type {
  Project,
  Resource,
  Session,
  Task,
  TaskDetail,
  Comment,
  User,
  WorkspaceBootstrap,
  Priority,
  Status,
} from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

export const TOKEN_STORAGE_KEY = 'pyramid.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private mode; the session then lasts
    // only as long as the tab.
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, unknown> } = {},
): Promise<T> {
  const { params, ...init } = options;

  const url = new URL(`${BASE_URL}/api${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(
        key,
        Array.isArray(value) ? value.join(',') : String(value),
      );
    }
  }

  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    // Nest's ValidationPipe returns `message` as an array of field errors.
    let message = response.statusText;
    try {
      const body = await response.json();
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? message);
    } catch {
      // Non-JSON error body (a gateway timeout, say) — keep the status text.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const DUE_FILTERS = ['overdue', 'today', 'week', 'none'] as const;
export type DueFilter = (typeof DUE_FILTERS)[number];

export const DUE_FILTER_LABELS: Record<DueFilter, string> = {
  overdue: 'Overdue',
  today: 'Today',
  week: 'This week',
  none: 'No due date',
};

export interface TaskFilters {
  q?: string;
  projectId?: string;
  due?: DueFilter;
  statusIds?: string[];
  priorities?: Priority[];
  assigneeIds?: string[];
  labelIds?: string[];
  teamIds?: string[];
}

export interface TaskInput {
  title: string;
  description?: string;
  statusId: string;
  projectId?: string;
  parentId?: string;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  assigneeIds?: string[];
  labelIds?: string[];
  teamIds?: string[];
}

export const api = {
  loginAsGuest: () => request<Session>('/auth/guest', { method: 'POST' }),

  me: () => request<{ user: User; workspace: { id: string; name: string } }>(
    '/auth/me',
  ),

  bootstrap: () => request<WorkspaceBootstrap>('/workspace/bootstrap'),

  updateProfile: (input: Partial<Pick<User, 'name' | 'title' | 'username' | 'avatarUrl'>>) =>
    request<User>('/workspace/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  createStatus: (input: { name: string; color?: string }) =>
    request<Status>('/workspace/statuses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteStatus: (id: string) =>
    request<{ id: string }>(`/workspace/statuses/${id}`, { method: 'DELETE' }),

  listTasks: (filters: TaskFilters = {}) =>
    request<Task[]>('/tasks', { params: filters as Record<string, unknown> }),

  getTask: (id: string) => request<TaskDetail>(`/tasks/${id}`),

  createTask: (input: TaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),

  updateTask: (id: string, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  moveTask: (id: string, input: { statusId: string; position: number }) =>
    request<TaskDetail>(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteTask: (id: string) =>
    request<{ id: string }>(`/tasks/${id}`, { method: 'DELETE' }),

  listProjects: (q?: string) => request<Project[]>('/projects', { params: { q } }),

  createProject: (input: {
    name: string;
    priority?: Priority;
    leadId?: string;
    dueDate?: string;
  }) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) }),

  updateProject: (
    id: string,
    input: Partial<{ name: string; priority: Priority; leadId: string; dueDate: string }>,
  ) =>
    request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deleteProject: (id: string) =>
    request<{ id: string }>(`/projects/${id}`, { method: 'DELETE' }),

  createResource: (taskId: string, input: { url: string; label?: string }) =>
    request<Resource>(`/tasks/${taskId}/resources`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteResource: (id: string) =>
    request<{ id: string }>(`/resources/${id}`, { method: 'DELETE' }),

  createComment: (taskId: string, input: { body: string; parentId?: string }) =>
    request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteComment: (id: string) =>
    request<{ id: string }>(`/comments/${id}`, { method: 'DELETE' }),
};
