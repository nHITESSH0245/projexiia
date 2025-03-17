
import React, { useState, useEffect } from 'react';
import { getProjectDocuments, deleteDocument, getDocumentUrl } from '@/lib/document';
import { Document, DocumentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
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
import { formatBytes, formatDate } from '@/lib/utils';
import { DocumentReviewForm } from './DocumentReviewForm';

interface DocumentsListProps {
  projectId: string;
  refreshTrigger?: number;
}

export function DocumentsList({ projectId, refreshTrigger = 0 }: DocumentsListProps) {
  const { role } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentToReview, setDocumentToReview] = useState<Document | null>(null);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { documents, error } = await getProjectDocuments(projectId);
      
      if (error) {
        throw error;
      }
      
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [projectId, refreshTrigger]);
  
  const handleDelete = async (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      const { success, error } = await deleteDocument(documentToDelete.id);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };
  
  const handleDownload = async (document: Document) => {
    try {
      const url = await getDocumentUrl(document.file_path);
      
      if (!url) {
        throw new Error('Failed to get document URL');
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
  
  const handleReview = (document: Document) => {
    setDocumentToReview(document);
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
  
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><FileCheck className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><FileX className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">
                    {getFileIcon(doc)}
                  </div>
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.created_at)}</span>
                      <span>•</span>
                      <span>{getStatusBadge(doc.status)}</span>
                    </div>
                    {doc.faculty_remarks && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Remarks:</span> {doc.faculty_remarks}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDownload(doc)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {role === 'faculty' && doc.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(doc)}
                    >
                      Review
                    </Button>
                  )}
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDelete(doc)}
                    title="Delete"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {documentToReview && (
        <DocumentReviewForm 
          document={documentToReview} 
          onComplete={() => {
            setDocumentToReview(null);
            fetchDocuments();
          }}
          onCancel={() => setDocumentToReview(null)}
        />
      )}
    </>
  );
}
