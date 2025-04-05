
import { supabase } from "@/integrations/supabase/client";
import { Feedback } from "@/types";

export const provideFeedback = async (
  projectId: string,
  comment: string,
  taskId?: string
) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be logged in to provide feedback');
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        project_id: projectId,
        faculty_id: user.id,
        comment,
        task_id: taskId || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { feedback: data, error: null };
  } catch (error: any) {
    console.error('Error providing feedback:', error);
    return { feedback: null, error };
  }
};

export const getProjectFeedback = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        faculty:faculty_id (
          name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { feedback: data as Feedback[], error: null };
  } catch (error: any) {
    console.error('Error fetching project feedback:', error);
    return { feedback: [], error };
  }
};
