
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Document, DocumentStatus, UserRole } from '@/types';
import { getProjectDocuments, getDocumentUrl, deleteDocument } from '@/lib/document';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  File as FileIcon, 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  FileCheck,
  FileX
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DocumentReviewForm } from './DocumentReviewForm';

interface DocumentsListProps {
  projectId: string;
  onDocumentChange?: () => void;
}

export function DocumentsList({ projectId, onDocumentChange }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [documentToReview, setDocumentToReview] = useState<Document | null>(null);
  const { user, role } = useAuth();

  const loadDocuments = async () => {
    setLoading(true);
    const { documents, error } = await getProjectDocuments(projectId);
    
    if (error) {
      toast.error('Failed to load documents');
    } else {
      setDocuments(documents);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const handleDelete = async (documentId: string) => {
    setDeleting(documentId);
    
    try {
      const { success, error } = await deleteDocument(documentId);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        toast.success('Document deleted successfully');
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        if (onDocumentChange) {
          onDocumentChange();
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const url = await getDocumentUrl(document.file_path);
      if (!url) {
        throw new Error('Could not generate download URL');
      }
      
      // Create a temporary anchor element
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleReviewComplete = () => {
    setDocumentToReview(null);
    loadDocuments();
    if (onDocumentChange) {
      onDocumentChange();
    }
  };

  // Function to get the appropriate icon based on file type
  const getFileIcon = (document: Document) => {
    const fileType = document.file_type;
    
    if (fileType.includes('image')) {
      return <FileIcon className="h-10 w-10" />;
    } else if (fileType.includes('pdf')) {
      return <FileIcon className="h-10 w-10" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileIcon className="h-10 w-10" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <FileIcon className="h-10 w-10" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileIcon className="h-10 w-10" />;
    } else if (fileType.includes('text') || fileType.includes('document')) {
      return <FileText className="h-10 w-10" />;
    } else {
      return <FileIcon className="h-10 w-10" />;
    }
  };

  // Function to get the status badge
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="ml-2 flex items-center gap-1"><FileCheck className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="ml-2 flex items-center gap-1"><FileX className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">Pending Review</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-center">No documents uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map(document => (
        <Card key={document.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="text-primary">
                {getFileIcon(document)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium truncate">{document.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatBytes(document.file_size)} • Uploaded on {new Date(document.created_at).toLocaleDateString()}
                    </p>
                    {document.faculty_remarks && (
                      <p className="text-sm mt-2 bg-muted p-2 rounded-sm">
                        <span className="font-medium">Remarks:</span> {document.faculty_remarks}
                      </p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(document.status)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-muted/50 py-2 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(document)}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            {role === 'faculty' && document.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => setDocumentToReview(document)}
                className="gap-1"
              >
                Review
              </Button>
            )}
            
            {role === 'student' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!!deleting}
                    className="gap-1"
                  >
                    {deleting === document.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{document.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(document.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      ))}
      
      {documentToReview && (
        <DocumentReviewForm
          document={documentToReview}
          onComplete={handleReviewComplete}
          onCancel={() => setDocumentToReview(null)}
        />
      )}
    </div>
  );
}
