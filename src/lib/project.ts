
import { supabase } from "@/integrations/supabase/client";
import { Analytics, Project } from "@/types";

export const createProject = async (
  title: string,
  description: string,
  status: string = 'planning',
  teamId?: string
) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to create a project');
    }

    console.log('Creating project with user ID:', user.id);
    
    const projectData: any = {
      title,
      description,
      status,
      student_id: user.id,
    };

    // Only add team_id if it exists
    if (teamId) {
      projectData.team_id = teamId;
    }

    console.log('Project data to insert:', projectData);

    // First try inserting without selecting to avoid potential RLS recursion
    const { error: insertError } = await supabase
      .from('projects')
      .insert(projectData);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw insertError;
    }

    // Then fetch the newly created project separately
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select()
      .eq('title', title)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      throw fetchError;
    }

    const project = projects && projects.length > 0 ? projects[0] : null;
    console.log('Project created successfully:', project);
    
    return { project, error: null };
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
        priority,
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

    // Calculate analytics with detailed project status counts
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const inReviewProjects = projects.filter(p => p.status === 'in_review').length;
    const changesRequestedProjects = projects.filter(p => p.status === 'changes_requested').length;
    const approvedProjects = projects.filter(p => p.status === 'approved').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'todo' || t.status === 'in_progress').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;

    const approvedDocuments = documents.filter(d => d.status === 'approved').length;

    const analytics: Analytics = {
      totalProjects: projects.length,
      completedProjects,
      totalTasks: tasks.length,
      completedTasks,
      totalDocuments: documents.length,
      approvedDocuments,
      pendingProjects,
      inReviewProjects,
      changesRequestedProjects,
      approvedProjects,
      pendingTasks,
      highPriorityTasks
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
      approvedDocuments: 0,
      pendingProjects: 0,
      inReviewProjects: 0,
      changesRequestedProjects: 0,
      approvedProjects: 0,
      pendingTasks: 0,
      highPriorityTasks: 0
    };
    
    return { analytics: emptyAnalytics, error };
  }
};
