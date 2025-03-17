
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File as FileIcon, X, Check } from 'lucide-react';
import { uploadDocument } from '@/lib/document';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';

interface DocumentUploaderProps {
  projectId: string;
  onUploadComplete: () => void;
}

export function DocumentUploader({ projectId, onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
      // Simple progress simulation since we can't track real progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 5;
          return next > 95 ? 95 : next;
        });
      }, 200);
      
      const result = await uploadDocument(projectId, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success('Document uploaded successfully!');
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {isDragActive
                ? "Drop the file here..."
                : "Drag and drop a file here, or click to select a file"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Max file size: 20MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileIcon className="h-8 w-8 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={cancelUpload}
                disabled={uploading}
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
                <Button onClick={handleUpload} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
