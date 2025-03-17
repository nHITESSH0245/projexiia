
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  File, 
  FileText, 
  FileImage, 
  FilePresentation, 
  X, 
  Check, 
  Trash, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { DocumentUploader } from './DocumentUploader';
import { DocumentReviewForm } from './DocumentReviewForm';
import { getProjectDocuments, deleteDocument } from '@/lib/document';
import { useAuth } from '@/contexts/AuthContext';
import { Document } from '@/types';
import { formatBytes } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentsListProps {
  projectId: string;
}

export function DocumentsList({ projectId }: DocumentsListProps) {
  const { role } = useAuth();
  const [documents, setDocuments] = useState<(Document & { url: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<(Document & { url: string }) | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { documents, error } = await getProjectDocuments(projectId);
      if (error) throw error;
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const handleUploadSuccess = () => {
    setIsUploaderOpen(false);
    fetchDocuments();
  };

  const handleReviewDocument = (document: Document & { url: string }) => {
    setSelectedDocument(document);
    setIsReviewDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const { success, error } = await deleteDocument(documentToDelete);
      if (error) throw error;
      
      if (success) {
        fetchDocuments();
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const confirmDelete = (docId: string) => {
    setDocumentToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const renderFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (
      fileType.includes('presentation') || 
      fileType.includes('powerpoint') || 
      fileType.includes('ppt')
    ) {
      return <FilePresentation className="h-6 w-6 text-orange-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
          <CardDescription>All documents submitted for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Documents</CardTitle>
          <CardDescription>All documents submitted for this project</CardDescription>
        </div>
        {role === 'student' && (
          <Dialog open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
            <DialogTrigger asChild>
              <Button>Upload Document</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <CardTitle className="mb-4">Upload Document</CardTitle>
              <DocumentUploader 
                projectId={projectId} 
                onSuccess={handleUploadSuccess} 
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No documents have been uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {renderFileIcon(doc.file_type)}
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(doc.file_size)}
                          </p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {doc.faculty_remarks && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Faculty remarks:</p>
                            <p className="text-muted-foreground">{doc.faculty_remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    {role === 'faculty' && doc.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => handleReviewDocument(doc)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                    
                    {role === 'student' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(doc.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedDocument && (
            <DocumentReviewForm 
              document={selectedDocument}
              onSuccess={() => {
                setIsReviewDialogOpen(false);
                fetchDocuments();
              }}
              onCancel={() => setIsReviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
