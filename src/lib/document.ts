
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentStatus } from "@/types";
import { toast } from "sonner";
import { createNotification } from "./notification";

// Helper function to generate a unique file path
const generateFilePath = (userId: string, projectId: string, fileName: string): string => {
  const timestamp = new Date().getTime();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${userId}/${projectId}/${timestamp}_${cleanFileName}`;
};

// Upload a document to storage and record in database
export const uploadDocument = async (
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ document: Document | null; error: Error | null }> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to upload documents');
    }

    // Create a unique file path
    const filePath = generateFilePath(user.id, projectId, file.name);
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('project_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percent = (progress.loaded / progress.total) * 100;
            onProgress(percent);
          }
        }
      });

    if (error) {
      throw error;
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        name: file.name,
        file_path: data.path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, try to delete the uploaded file
      await supabase.storage.from('project_documents').remove([data.path]);
      throw dbError;
    }

    return { document: document as Document, error: null };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { document: null, error: error as Error };
  }
};

// Get all documents for a project
export const getProjectDocuments = async (projectId: string): Promise<{ documents: Document[]; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { documents: data as Document[], error: null };
  } catch (error) {
    console.error('Error fetching project documents:', error);
    return { documents: [], error: error as Error };
  }
};

// Get all documents for faculty review
export const getAllDocumentsForReview = async (): Promise<{ documents: Document[]; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        projects:project_id (
          *,
          profiles:student_id ( name, email, avatar_url )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data to match our Document interface
    const documents = data.map(doc => {
      const projectData = doc.projects as any;
      const studentData = projectData?.profiles || {};
      
      return {
        id: doc.id,
        project_id: doc.project_id,
        name: doc.name,
        file_path: doc.file_path,
        file_type: doc.file_type,
        file_size: doc.file_size,
        uploaded_by: doc.uploaded_by,
        status: doc.status as DocumentStatus,
        faculty_remarks: doc.faculty_remarks,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        project: {
          title: projectData?.title || 'Unknown Project',
          student: {
            name: studentData?.name || 'Unknown Student',
            email: studentData?.email || '',
            avatar_url: studentData?.avatar_url
          }
        }
      } as Document;
    });

    return { documents, error: null };
  } catch (error) {
    console.error('Error fetching documents for review:', error);
    return { documents: [], error: error as Error };
  }
};

// Get public URL for a document
export const getDocumentUrl = async (filePath: string): Promise<string> => {
  try {
    const { data } = await supabase.storage
      .from('project_documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return '';
  }
};

// Delete a document
export const deleteDocument = async (documentId: string): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // First, get the document to find its file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('project_documents')
      .remove([document.file_path]);

    if (storageError) {
      throw storageError;
    }

    // Delete the database record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw dbError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error as Error };
  }
};

// Review a document (faculty only)
export const reviewDocument = async (
  documentId: string,
  status: DocumentStatus,
  remarks?: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // Update document status and remarks
    const { data: document, error: updateError } = await supabase
      .from('documents')
      .update({
        status,
        faculty_remarks: remarks || null
      })
      .eq('id', documentId)
      .select(`
        *,
        projects:project_id (
          *
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create notification for the student
    const projectData = document.projects as any;
    if (projectData && projectData.student_id) {
      const statusText = status === 'approved' ? 'approved' : 'rejected';
      const notificationTitle = `Document ${statusText}`;
      const notificationMessage = `Your document "${document.name}" has been ${statusText} by faculty.`;

      await createNotification(
        projectData.student_id,
        notificationTitle,
        notificationMessage,
        'document_feedback',
        document.project_id
      );
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error reviewing document:', error);
    return { success: false, error: error as Error };
  }
};
