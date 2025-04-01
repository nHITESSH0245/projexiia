
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { uploadDocument } from '@/lib/document';
import { updateMilestoneDocument } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface TimelineDocumentUploaderProps {
  projectId: string;
  milestoneId: string;
  onUploadComplete: () => void;
}

export function TimelineDocumentUploader({ 
  projectId, 
  milestoneId, 
  onUploadComplete 
}: TimelineDocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 20 * 1024 * 1024, // 20MB max
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Simple progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 200);
      
      // Upload document
      const { document, error } = await uploadDocument(projectId, file);
      
      clearInterval(progressInterval);
      
      if (error) {
        throw error;
      }
      
      if (document) {
        // Link document to milestone
        const result = await updateMilestoneDocument(milestoneId, document.id);
        if (result.error) {
          throw result.error;
        }
        
        setProgress(100);
        toast.success('Document uploaded successfully! Waiting for faculty approval.');
        setFile(null);
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setProgress(0);
  };

  if (!file) {
    return (
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-5 w-5 mb-1 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here..."
            : "Drag and drop a file here, or click to select"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={cancelUpload}
          disabled={uploading}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
        </div>
      )}
      
      {!uploading && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}
