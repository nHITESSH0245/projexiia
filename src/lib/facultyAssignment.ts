
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createNotification } from "./notification";

// Type definitions for faculty assignments
export interface FacultyAssignment {
  id: string;
  project_id: string;
  faculty_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Get all faculty assignments for a project
export const getProjectFacultyAssignments = async (projectId: string): Promise<{ assignments: FacultyAssignment[]; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('faculty_review_assignments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { assignments: data as FacultyAssignment[], error: null };
  } catch (error) {
    console.error('Error fetching faculty assignments:', error);
    return { assignments: [], error: error as Error };
  }
};

// Assign a faculty to review a project
export const assignFacultyToProject = async (
  projectId: string,
  facultyEmail: string
): Promise<{ assignment: FacultyAssignment | null; error: Error | null }> => {
  try {
    // First check if this faculty is already assigned to this project
    const { data: existingAssignments } = await supabase
      .from('faculty_review_assignments')
      .select('id')
      .eq('project_id', projectId)
      .eq('faculty_email', facultyEmail);

    if (existingAssignments && existingAssignments.length > 0) {
      throw new Error('This faculty member is already assigned to this project');
    }

    // Create the assignment
    const { data, error } = await supabase
      .from('faculty_review_assignments')
      .insert({
        project_id: projectId,
        faculty_email: facultyEmail,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Faculty member assigned successfully');
    
    return { assignment: data as FacultyAssignment, error: null };
  } catch (error) {
    console.error('Error assigning faculty to project:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to assign faculty');
    return { assignment: null, error: error as Error };
  }
};

// Remove a faculty assignment
export const removeFacultyAssignment = async (assignmentId: string): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('faculty_review_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      throw error;
    }

    toast.success('Faculty assignment removed');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing faculty assignment:', error);
    toast.error('Failed to remove faculty assignment');
    return { success: false, error: error as Error };
  }
};

// Get assigned projects for faculty
export const getFacultyAssignedProjects = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to view assigned projects');
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_student_id_fkey (*),
        faculty_review_assignments!inner (*)
      `)
      .eq('faculty_review_assignments.faculty_email', profile.email)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { projects: data, error: null };
  } catch (error) {
    console.error('Error fetching faculty assigned projects:', error);
    return { projects: [], error };
  }
};
