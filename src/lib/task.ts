
import { supabase } from "@/integrations/supabase/client";

export const createTask = async (
  projectId: string,
  title: string,
  description: string,
  priority: string = 'medium',
  dueDate: string,
  status: string = 'pending'
) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: projectId,
        title,
        description,
        priority,
        due_date: dueDate,
        status
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { task: data, error: null };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { task: null, error };
  }
};
