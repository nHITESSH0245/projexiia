
// User roles
export type UserRole = 'student' | 'faculty' | 'admin';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

// Project status - updated to match the string literals used in the code
export type ProjectStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';

// Project type - updated to include tasks and profiles properties
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
  student?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

// Document status
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

// Document type
export interface Document {
  id: string;
  project_id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  status: DocumentStatus;
  faculty_remarks?: string;
  created_at: string;
  updated_at: string;
  project?: {
    title: string;
    student: {
      name: string;
      email: string;
      avatar_url?: string;
    };
  };
}

// Analytics type - expanded to include all the properties used in the AnalyticsOverview component
export interface Analytics {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalDocuments: number;
  approvedDocuments: number;
  pendingProjects: number;
  inReviewProjects: number;
  changesRequestedProjects: number;
  approvedProjects: number;
  pendingTasks: number;
  highPriorityTasks: number;
}

// Milestone type
export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  document_id?: string;
  created_at: string;
  updated_at: string;
}

// Feedback type
export interface Feedback {
  id: string;
  project_id: string;
  faculty_id: string;
  task_id?: string;
  comment: string;
  created_at: string;
  faculty?: {
    name: string;
    avatar_url?: string;
  };
}

// Task type
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed' | 'pending' | 'in-progress' | 'review';
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Notification type
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// Team related types
export interface Team {
  id: string;
  name: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
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
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  team?: Team;
  inviter?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}
