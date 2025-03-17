
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentStatus } from '@/types';
import { createNotification } from './notification';
import { formatBytes } from '@/lib/utils';

// Upload a document to a project
export const uploadDocument = async (
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast.error('You must be logged in to upload documents');
      return { document: null, error: new Error('User not authenticated') };
    }

    // Create a folder structure: project_documents/user_id/project_id/filename
    const userId = userData.user.id;
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = `${userId}/${projectId}/${uniqueFileName}`;

    // Upload file to storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('project_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress(progress.percent || 0);
          }
        },
      });

    if (fileError) {
      toast.error(`Failed to upload file: ${fileError.message}`);
      return { document: null, error: fileError };
    }

    // Get public URL for the file
    const { data: publicURL } = supabase.storage
      .from('project_documents')
      .getPublicUrl(filePath);

    // Create record in documents table
    const { data, error } = await supabase
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
      toast.error(`Failed to save document info: ${error.message}`);
      
      // Clean up the uploaded file if record creation failed
      await supabase.storage
        .from('project_documents')
        .remove([filePath]);
        
      return { document: null, error };
    }

    // Get project info for notification
    const { data: projectData } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();

    // Notify student that document was uploaded successfully
    toast.success(`Document "${file.name}" uploaded successfully!`);

    return { document: data as Document, error: null };
  } catch (error: any) {
    console.error('Document upload error:', error);
    toast.error('Failed to upload document. Please try again.');
    return { document: null, error };
  }
};

// Get project documents
export const getProjectDocuments = async (projectId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch documents error:', error);
      return { documents: [], error };
    }

    // Get public URLs for all files
    const documentsWithUrls = await Promise.all(
      (data as Document[]).map(async (doc) => {
        const { data: publicURL } = supabase.storage
          .from('project_documents')
          .getPublicUrl(doc.file_path);

        return { ...doc, url: publicURL.publicUrl };
      })
    );

    return { documents: documentsWithUrls as (Document & { url: string })[], error: null };
  } catch (error) {
    console.error('Fetch documents error:', error);
    return { documents: [], error };
  }
};

// Update document status and remarks (for faculty)
export const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus,
  remarks?: string
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast.error('You must be logged in to review documents');
      return { document: null, error: new Error('User not authenticated') };
    }

    // Get faculty role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (!profileData || profileData.role !== 'faculty') {
      toast.error('Only faculty members can review documents');
      return { document: null, error: new Error('Unauthorized') };
    }

    // Update document status and remarks
    const { data, error } = await supabase
      .from('documents')
      .update({
        status,
        faculty_remarks: remarks
      })
      .eq('id', documentId)
      .select('*, projects!inner(*)')
      .single();

    if (error) {
      toast.error(`Failed to update document status: ${error.message}`);
      return { document: null, error };
    }

    // Create notification for the student
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const notificationTitle = `Document ${statusText}`;
    const notificationMessage = `Your document "${data.name}" has been ${statusText} by faculty.`;
    
    await createNotification(
      data.projects.student_id,
      notificationTitle,
      notificationMessage,
      'document_feedback',
      data.project_id
    );

    toast.success(`Document ${statusText} successfully`);
    return { document: data as Document, error: null };
  } catch (error: any) {
    console.error('Document status update error:', error);
    toast.error('Failed to update document status. Please try again.');
    return { document: null, error };
  }
};

// Delete a document
export const deleteDocument = async (documentId: string) => {
  try {
    // Get document details first to get file path
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) {
      toast.error(`Failed to find document: ${docError.message}`);
      return { success: false, error: docError };
    }

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('project_documents')
      .remove([docData.file_path]);

    if (storageError) {
      toast.error(`Failed to delete file: ${storageError.message}`);
      return { success: false, error: storageError };
    }

    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      toast.error(`Failed to delete document record: ${error.message}`);
      return { success: false, error };
    }

    toast.success('Document deleted successfully');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Document deletion error:', error);
    toast.error('Failed to delete document. Please try again.');
    return { success: false, error };
  }
};
