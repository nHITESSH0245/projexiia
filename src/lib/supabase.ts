import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Project, Task, Feedback, Analytics, ProjectStatus, TaskStatus } from '@/types';
import { createNotification } from './notification';

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    toast.error('Failed to sign in. Please try again.');
    return { user: null, error };
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: 'student' | 'faculty'
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }

    toast.success('Account created! Please check your email to confirm your registration.');
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    toast.error('Failed to sign up. Please try again.');
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    toast.success('Signed out successfully');
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error('Failed to sign out. Please try again.');
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return { user: null, error };
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { user: data.user, profile: null, error: profileError };
    }
    
    return { 
      user: data.user, 
      profile: profileData,
      error: null 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, profile: null, error };
  }
};

// Project management functions
export const createProject = async (title: string, description: string, teamId?: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    const projectData: any = {
      title,
      description,
      student_id: userData.user.id,
      status: 'pending'
    };

    if (teamId) {
      projectData.team_id = teamId;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to create project: ${error.message}`);
      return { project: null, error };
    }

    toast.success('Project created successfully!');
    return { project: data as Project, error: null };
  } catch (error) {
    console.error('Project creation error:', error);
    toast.error('Failed to create project. Please try again.');
    return { project: null, error };
  }
};

export const getStudentProjects = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { projects: [], error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*, tasks(*)')
      .eq('student_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch projects error:', error);
      return { projects: [], error };
    }

    return { projects: data as Project[], error: null };
  } catch (error) {
    console.error('Fetch projects error:', error);
    return { projects: [], error };
  }
};

export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks(*),
        profiles!projects_student_id_fkey(name, email, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch all projects error:', error);
      return { projects: [], error };
    }

    return { projects: data as Project[], error: null };
  } catch (error) {
    console.error('Fetch all projects error:', error);
    return { projects: [], error };
  }
};

export const createTask = async (
  projectId: string, 
  title: string, 
  description: string, 
  dueDate: Date, 
  priority: 'high' | 'medium' | 'low'
) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        title,
        description,
        due_date: dueDate.toISOString(),
        priority,
        status: 'todo'
      })
      .select()
      .single();

    if (error) {
      toast.error(`Failed to create task: ${error.message}`);
      return { task: null, error };
    }

    const { data: projectData } = await supabase
      .from('projects')
      .select('student_id, title')
      .eq('id', projectId)
      .single();

    if (projectData) {
      await createNotification(
        projectData.student_id,
        'New Task Assigned',
        `A new task "${title}" has been added to your project "${projectData.title}"`,
        'task_assigned',
        projectId
      );
    }

    toast.success('Task created successfully!');
    return { task: data as Task, error: null };
  } catch (error) {
    console.error('Task creation error:', error);
    toast.error('Failed to create task. Please try again.');
    return { task: null, error };
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to update task: ${error.message}`);
      return { task: null, error };
    }

    toast.success('Task updated successfully!');
    return { task: data as Task, error: null };
  } catch (error) {
    console.error('Task update error:', error);
    toast.error('Failed to update task. Please try again.');
    return { task: null, error };
  }
};

export const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to update project: ${error.message}`);
      return { project: null, error };
    }

    const { data: projectData } = await supabase
      .from('projects')
      .select('student_id, title')
      .eq('id', projectId)
      .single();

    if (projectData) {
      await createNotification(
        projectData.student_id,
        'Project Status Updated',
        `Your project "${projectData.title}" status has been updated to ${status.replace('_', ' ')}`,
        'status_change',
        projectId
      );
    }

    toast.success('Project status updated!');
    return { project: data as Project, error: null };
  } catch (error) {
    console.error('Project update error:', error);
    toast.error('Failed to update project. Please try again.');
    return { project: null, error };
  }
};

export const provideFeedback = async (projectId: string, comment: string, taskId?: string) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { error: new Error('User not authenticated') };
    }

    const feedbackData: any = {
      project_id: projectId,
      faculty_id: userData.user.id,
      comment
    };

    if (taskId) {
      feedbackData.task_id = taskId;
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      toast.error(`Failed to submit feedback: ${error.message}`);
      return { feedback: null, error };
    }

    const { data: projectData } = await supabase
      .from('projects')
      .select('student_id, title')
      .eq('id', projectId)
      .single();

    if (projectData) {
      await createNotification(
        projectData.student_id,
        'New Feedback Received',
        `You've received new feedback on your project "${projectData.title}"`,
        'feedback',
        projectId
      );
    }

    toast.success('Feedback submitted successfully!');
    return { feedback: data as Feedback, error: null };
  } catch (error) {
    console.error('Feedback error:', error);
    toast.error('Failed to submit feedback. Please try again.');
    return { feedback: null, error };
  }
};

export const getProjectFeedback = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles!feedback_faculty_id_fkey(name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch feedback error:', error);
      return { feedback: [], error };
    }

    return { feedback: data as Feedback[], error: null };
  } catch (error) {
    console.error('Fetch feedback error:', error);
    return { feedback: [], error };
  }
};

// Analytics functions
export const getStudentAnalytics = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { analytics: null, error: new Error('User not authenticated') };
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('student_id', userData.user.id);

    if (projectsError) {
      console.error('Fetch projects for analytics error:', projectsError);
      return { analytics: null, error: projectsError };
    }

    const projectIds = projectsData.map(p => p.id);
    const { data: tasksData, error: tasksError } = projectIds.length > 0 
      ? await supabase
          .from('tasks')
          .select('status, priority')
          .in('project_id', projectIds)
      : { data: [], error: null };

    if (tasksError) {
      console.error('Fetch tasks for analytics error:', tasksError);
      return { analytics: null, error: tasksError };
    }

    const analytics: Analytics = {
      pendingProjects: projectsData.filter(p => p.status === 'pending').length,
      inReviewProjects: projectsData.filter(p => p.status === 'in_review').length,
      changesRequestedProjects: projectsData.filter(p => p.status === 'changes_requested').length,
      approvedProjects: projectsData.filter(p => p.status === 'approved').length,
      completedTasks: tasksData.filter(t => t.status === 'completed').length,
      pendingTasks: tasksData.filter(t => t.status !== 'completed').length,
      highPriorityTasks: tasksData.filter(t => t.priority === 'high').length
    };

    return { analytics, error: null };
  } catch (error) {
    console.error('Get student analytics error:', error);
    return { analytics: null, error };
  }
};

export const getFacultyAnalytics = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { analytics: null, error: new Error('User not authenticated') };
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('status');

    if (projectsError) {
      console.error('Fetch projects for analytics error:', projectsError);
      return { analytics: null, error: projectsError };
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('status, priority');

    if (tasksError) {
      console.error('Fetch tasks for analytics error:', tasksError);
      return { analytics: null, error: tasksError };
    }

    const analytics: Analytics = {
      pendingProjects: projectsData.filter(p => p.status === 'pending').length,
      inReviewProjects: projectsData.filter(p => p.status === 'in_review').length,
      changesRequestedProjects: projectsData.filter(p => p.status === 'changes_requested').length,
      approvedProjects: projectsData.filter(p => p.status === 'approved').length,
      completedTasks: tasksData.filter(t => t.status === 'completed').length,
      pendingTasks: tasksData.filter(t => t.status !== 'completed').length,
      highPriorityTasks: tasksData.filter(t => t.priority === 'high').length
    };

    return { analytics, error: null };
  } catch (error) {
    console.error('Get faculty analytics error:', error);
    return { analytics: null, error };
  }
};
