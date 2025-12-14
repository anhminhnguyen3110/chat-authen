'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCanvas } from '@/contexts/CanvasContext';

interface FileUploadDialogProps {
  threadId: string;
  onFileUploaded?: () => void;
}

export function FileUploadDialog({ threadId, onFileUploaded }: FileUploadDialogProps) {
  const { uploadFile } = useCanvas();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadResult(null);

      const result = await uploadFile(threadId, selectedFile);

      setUploadResult({
        success: true,
        message: result.message,
      });

      toast.success(result.message);
      onFileUploaded?.();

      // Reset after success
      setTimeout(() => {
        setOpen(false);
        setSelectedFile(null);
        setUploadResult(null);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      setUploadResult({
        success: false,
        message,
      });
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="size-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload documents, images, or other files. Supported formats will be automatically converted to markdown.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="size-6 text-primary" />
                </div>
                {isDragActive ? (
                  <p className="text-sm font-medium">Drop file here...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drag & drop a file here</p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Max file size: 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                <File className="size-5 text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadResult(null);
                  }}
                  disabled={isUploading}
                >
                  <XCircle className="size-4" />
                </Button>
              </div>

              {uploadResult && (
                <div
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border
                    ${uploadResult.success 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                    }
                  `}
                >
                  {uploadResult.success ? (
                    <CheckCircle2 className="size-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 text-red-600 mt-0.5" />
                  )}
                  <p className="text-sm flex-1">{uploadResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
