
export type UserRole = 'student' | 'faculty';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type ProjectStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
export type NotificationType = 'feedback' | 'status_change' | 'task_assigned' | 'deadline';

export interface Project {
  id: string;
  title: string;
  description: string;
  student_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
  profiles?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  task_id?: string;
  faculty_id: string;
  comment: string;
  created_at: string;
  faculty?: {
    name: string;
    avatar_url?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: NotificationType;
  related_id?: string;
  created_at: string;
}

export interface Analytics {
  pendingProjects: number;
  inReviewProjects: number;
  changesRequestedProjects: number;
  approvedProjects: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
}
