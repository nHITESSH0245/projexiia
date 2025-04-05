
import { supabase } from "@/integrations/supabase/client";
import { Analytics, Project } from "@/types";

export const createProject = async (
  title: string,
  description: string,
  status: string = 'planning'
) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to create a project');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        student_id: user.id,
        status
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { project: data, error: null };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { project: null, error };
  }
};

export const getStudentProjects = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to fetch projects');
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:student_id (
          name,
          email,
          avatar_url
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { projects: data as Project[], error: null };
  } catch (error: any) {
    console.error('Error fetching student projects:', error);
    return { projects: [], error };
  }
};

export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:student_id (
          name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { projects: data as Project[], error: null };
  } catch (error: any) {
    console.error('Error fetching all projects:', error);
    return { projects: [], error };
  }
};

export const getStudentAnalytics = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to fetch analytics');
    }

    // Get projects count
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('student_id', user.id);

    if (projectsError) {
      throw projectsError;
    }

    // Get tasks count and completion statistics
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        status,
        project_id,
        projects!inner (
          student_id
        )
      `)
      .eq('projects.student_id', user.id);

    if (tasksError) {
      throw tasksError;
    }

    // Get documents count and status statistics
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(`
        id,
        status,
        project_id,
        projects!inner (
          student_id
        )
      `)
      .eq('projects.student_id', user.id);

    if (documentsError) {
      throw documentsError;
    }

    // Calculate analytics
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const approvedDocuments = documents.filter(d => d.status === 'approved').length;

    const analytics: Analytics = {
      totalProjects: projects.length,
      completedProjects,
      totalTasks: tasks.length,
      completedTasks,
      totalDocuments: documents.length,
      approvedDocuments
    };

    return { analytics, error: null };
  } catch (error: any) {
    console.error('Error fetching student analytics:', error);
    
    // Return empty analytics object if there's an error
    const emptyAnalytics: Analytics = {
      totalProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalDocuments: 0,
      approvedDocuments: 0
    };
    
    return { analytics: emptyAnalytics, error };
  }
};
