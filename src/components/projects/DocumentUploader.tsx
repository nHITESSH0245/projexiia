
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { File, Upload, X } from 'lucide-react';
import { uploadDocument } from '@/lib/document';
import { formatBytes } from '@/lib/utils';

interface DocumentUploaderProps {
  projectId: string;
  onSuccess: () => void;
}

export function DocumentUploader({ projectId, onSuccess }: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    // Just take the first file
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      const { document, error } = await uploadDocument(
        projectId, 
        selectedFile,
        (progress) => setProgress(progress)
      );
      
      if (error) {
        throw error;
      }
      
      setSelectedFile(null);
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Drag and drop a file here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Support for PDF, Word, PowerPoint, images, and more (Max 50MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-primary" />
              <div className="overflow-hidden">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>
            {!uploading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearSelectedFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {uploading && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {Math.round(progress)}% uploaded...
              </p>
            </div>
          )}
          
          {!uploading && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
