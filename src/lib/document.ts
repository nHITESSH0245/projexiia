
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentStatus } from "@/types";
import { toast } from "sonner";
import { createNotification } from "./notification";
import { 
  uploadDocumentToStorage,
  createDocumentRecord,
  getProjectDocumentRecords,
  getDocumentsWithProjectInfo,
  getPublicDocumentUrl,
  removeDocumentAndFile,
  updateDocumentStatusAndNotify
} from "./documentUtils";

// Helper function to generate a unique file path
const generateFilePath = (userId: string, projectId: string, fileName: string): string => {
  const timestamp = new Date().getTime();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${userId}/${projectId}/${timestamp}_${cleanFileName}`;
};

// Upload a document to storage and record in database
export const uploadDocument = async (
  projectId: string,
  file: File
): Promise<{ document: Document | null; error: Error | null }> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to upload documents');
    }

    console.log('Uploading document for project:', projectId);
    console.log('File details:', file.name, file.type, file.size);

    // Create a unique file path
    const filePath = generateFilePath(user.id, projectId, file.name);
    
    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const projectDocumentsBucket = buckets?.find(b => b.name === 'project_documents');
    
    if (!projectDocumentsBucket) {
      console.log('Creating project_documents bucket');
      // Create the bucket if it doesn't exist
      const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('project_documents', {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        allowedMimeTypes: [] as string[] // Explicitly typed as string array
      });
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        throw new Error('Failed to create storage bucket: ' + bucketError.message);
      }
      
      // Set up RLS policies for the bucket
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: 'project_documents',
        policy_name: 'Allow authenticated users to upload files',
        definition: 'auth.role() = \'authenticated\''
      });
      
      if (policyError) {
        console.warn('Warning setting bucket policy:', policyError);
        // Continue anyway, we don't want to block users if policy creation fails
      }
    }
    
    // Upload file to storage
    const uploadResult = await uploadDocumentToStorage(filePath, file);
    if (uploadResult.error) {
      throw uploadResult.error;
    }

    // Create document record in database
    const documentResult = await createDocumentRecord(
      projectId,
      file,
      uploadResult.path,
      user.id
    );

    if (documentResult.error) {
      // If database insert fails, try to delete the uploaded file
      await supabase.storage.from('project_documents').remove([uploadResult.path]);
      throw documentResult.error;
    }

    return { document: documentResult.document, error: null };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { document: null, error: error as Error };
  }
};

// Get all documents for a project
export const getProjectDocuments = async (projectId: string): Promise<{ documents: Document[]; error: Error | null }> => {
  return await getProjectDocumentRecords(projectId);
};

// Get all documents for faculty review
export const getAllDocumentsForReview = async (): Promise<{ documents: Document[]; error: Error | null }> => {
  return await getDocumentsWithProjectInfo();
};

// Get public URL for a document
export const getDocumentUrl = async (filePath: string): Promise<string> => {
  return await getPublicDocumentUrl(filePath);
};

// Delete a document
export const deleteDocument = async (documentId: string): Promise<{ success: boolean; error: Error | null }> => {
  return await removeDocumentAndFile(documentId);
};

// Review a document (faculty only)
export const reviewDocument = async (
  documentId: string,
  status: DocumentStatus,
  remarks?: string
): Promise<{ success: boolean; error: Error | null }> => {
  return await updateDocumentStatusAndNotify(documentId, status, remarks);
};
