
import React, { useState } from 'react';
import { Document, DocumentStatus } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileCheck, 
  FileX, 
  Loader2, 
  FileText, 
  FileImage, 
  FilePdf, 
  FileArchive, 
  File,
  Presentation,
  ExternalLink 
} from 'lucide-react';
import { reviewDocument, getDocumentUrl } from '@/lib/document';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface DocumentReviewFormProps {
  document: Document;
  onComplete: () => void;
  onCancel: () => void;
}

export function DocumentReviewForm({ document, onComplete, onCancel }: DocumentReviewFormProps) {
  const [remarks, setRemarks] = useState(document.faculty_remarks || '');
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const loadPreviewUrl = async () => {
    const url = await getDocumentUrl(document.file_path);
    setPreviewUrl(url);
  };
  
  React.useEffect(() => {
    loadPreviewUrl();
  }, [document]);

  const handleReview = async (status: DocumentStatus) => {
    setSubmitting(true);
    
    try {
      const { success, error } = await reviewDocument(document.id, status, remarks);
      
      if (error) {
        throw error;
      }
      
      if (success) {
        toast.success(`Document ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        onComplete();
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to review document');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to get the appropriate icon based on file type
  const getFileIcon = () => {
    const fileType = document.file_type;
    
    if (fileType.includes('image')) {
      return <FileImage className="h-12 w-12" />;
    } else if (fileType.includes('pdf')) {
      return <FilePdf className="h-12 w-12" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <Presentation className="h-12 w-12" />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <FileArchive className="h-12 w-12" />;
    } else if (fileType.includes('text') || fileType.includes('document')) {
      return <FileText className="h-12 w-12" />;
    } else {
      return <File className="h-12 w-12" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Document</DialogTitle>
          <DialogDescription>
            Review and provide feedback for this student document.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4">
            <div className="text-primary">
              {getFileIcon()}
            </div>
            <div>
              <h3 className="font-medium">{document.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatBytes(document.file_size)} • Uploaded on {new Date(document.created_at).toLocaleDateString()}
              </p>
              {previewUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 gap-2"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open document
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="remarks">Faculty Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Provide feedback or comments about this document"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileX className="h-4 w-4" />
              )}
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => handleReview('approved')}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
