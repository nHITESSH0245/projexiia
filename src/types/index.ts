
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
export type NotificationType = 'feedback' | 'status_change' | 'task_assigned' | 'deadline' | 'team_invite' | 'team_update';
export type TeamMemberRole = 'leader' | 'member';
export type TeamInviteStatus = 'pending' | 'accepted' | 'rejected';

export interface Project {
  id: string;
  title: string;
  description: string;
  student_id: string;
  team_id?: string;
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

export interface Team {
  id: string;
  name: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  projects?: Project[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  join_date: string;
  profile?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamInvite {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  status: TeamInviteStatus;
  created_at: string;
  updated_at: string;
  team?: Team;
  inviter?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  invitee?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}
