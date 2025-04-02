
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentStatus } from "@/types";
import { createNotification } from "./notification";

// Upload file to storage
export const uploadDocumentToStorage = async (
  filePath: string,
  file: File
): Promise<{ path: string; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from('project_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { path: '', error };
    }

    console.log('File uploaded successfully:', data);
    return { path: data.path, error: null };
  } catch (error) {
    console.error('Error in uploadDocumentToStorage:', error);
    return { path: '', error: error as Error };
  }
};

// Create document record in database
export const createDocumentRecord = async (
  projectId: string,
  file: File,
  filePath: string,
  userId: string
): Promise<{ document: Document | null; error: Error | null }> => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return { document: null, error };
    }

    console.log('Document record created:', document);
    return { document: document as Document, error: null };
  } catch (error) {
    console.error('Error in createDocumentRecord:', error);
    return { document: null, error: error as Error };
  }
};

// Get all documents for a project
export const getProjectDocumentRecords = async (
  projectId: string
): Promise<{ documents: Document[]; error: Error | null }> => {
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

// Get all documents with project information for faculty review
export const getDocumentsWithProjectInfo = async (): Promise<{ documents: Document[]; error: Error | null }> => {
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
export const getPublicDocumentUrl = async (filePath: string): Promise<string> => {
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

// Remove document and its file
export const removeDocumentAndFile = async (
  documentId: string
): Promise<{ success: boolean; error: Error | null }> => {
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

// Update document status and notify student
export const updateDocumentStatusAndNotify = async (
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
