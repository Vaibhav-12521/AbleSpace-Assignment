export type Priority =
  | 'NO_PRIORITY'
  | 'URGENT'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  title?: string | null;
  avatarUrl?: string | null;
  isGuest?: boolean;
}

export interface Member extends User {
  role: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  status: Status;
  projectId: string | null;
  parentId: string | null;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  position: number;
  reporter: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
  assignees: Array<Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>>;
  labels: Label[];
  teams: Team[];
  subtaskCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
}

export interface Comment {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  replies?: Comment[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'> | null;
}

export interface TaskDetail extends Task {
  resources: Resource[];
  subtasks: Task[];
  comments: Comment[];
  activities: Activity[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  position: number;
  lead: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null;
  _count: { tasks: number };
}

export interface WorkspaceBootstrap {
  statuses: Status[];
  labels: Label[];
  teams: Team[];
  members: Member[];
}

export interface Session {
  accessToken: string;
  user: User;
  workspace: Workspace;
}
