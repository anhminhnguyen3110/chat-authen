'use client';

import React, { useEffect, useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import { FileCode, FileText, File, Trash2, FolderOpen, Search, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { CreateFileDialog } from '@/components/thread/CreateFileDialog';

interface FilesPanelProps {
  threadId: string;
}

export function FilesPanel({ threadId }: FilesPanelProps) {
  const { threadFiles, currentFile, setCurrentFile, loadThreadFiles } = useCanvas();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (threadId) {
      loadThreadFiles(threadId);
    }
  }, [threadId, loadThreadFiles]);

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success('File deleted');
      loadThreadFiles(threadId);
      
      // Clear current file if it was deleted
      if (currentFile?.fileId === fileId) {
        setCurrentFile(null);
      }
    } catch (error) {
      toast.error('Failed to delete file');
      console.error(error);
    }
  };

  const handleDownloadFile = async (fileId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files/${fileId}/download`);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
      console.error(error);
    }
  };

  const filteredFiles = threadFiles.filter((file) =>
    file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files by type
  const codeFiles = filteredFiles.filter((f) => f.type === 'code');
  const markdownFiles = filteredFiles.filter((f) => f.type === 'markdown');
  const otherFiles = filteredFiles.filter((f) => f.type !== 'code' && f.type !== 'markdown');

  const getFileIcon = (type: string) => {
    if (type === 'code') return FileCode;
    if (type === 'markdown') return FileText;
    return File;
  };

  const renderFileGroup = (title: string, files: typeof threadFiles, icon: React.ReactNode) => {
    if (files.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {icon}
          <span>{title}</span>
          <span className="ml-auto text-muted-foreground/60">({files.length})</span>
        </div>
        <div className="space-y-0.5 px-2">
          {files.map((file) => {
            const isActive = currentFile?.fileId === file.fileId;
            const Icon = getFileIcon(file.type);
            
            return (
              <TooltipProvider key={file.fileId}>
                <div
                  className={cn(
                    'group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all',
                    isActive
                      ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                      : 'hover:bg-secondary text-foreground border border-transparent hover:border-border'
                  )}
                  onClick={() => setCurrentFile(file)}
                >
                  <Icon className={cn('size-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm font-medium truncate', isActive && 'font-semibold')}>
                      {file.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {file.language && (
                        <span className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-medium">
                          {file.language}
                        </span>
                      )}
                      <span className="text-[10px]">
                        {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'size-7 opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-primary/10 hover:text-primary'
                          )}
                          onClick={(e) => handleDownloadFile(file.fileId, file.title, e)}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Download file</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'size-7 opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-destructive/10 hover:text-destructive'
                          )}
                          onClick={(e) => handleDeleteFile(file.fileId, e)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Delete file</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  if (!threadFiles.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="rounded-full bg-secondary p-4 mb-3">
          <FolderOpen className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Workspace Empty</p>
        <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
          Create or upload files to start building your project
        </p>
        <CreateFileDialog threadId={threadId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-secondary/50">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-gray-800">Workspace Files</h3>
          </div>
          <CreateFileDialog threadId={threadId} variant="ghost" />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary border-border"
          />
        </div>
      </div>

      {/* Files List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No files match your search
            </div>
          ) : (
            <>
              {renderFileGroup('Code Files', codeFiles, <FileCode className="size-3.5" />)}
              {renderFileGroup('Documents', markdownFiles, <FileText className="size-3.5" />)}
              {renderFileGroup('Other Files', otherFiles, <File className="size-3.5" />)}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
