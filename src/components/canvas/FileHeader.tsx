'use client';

import React, { useState } from 'react';
import { Check, X, Loader, Download, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCanvas } from '@/contexts/CanvasContext';
import { VersionNavigation } from './VersionNavigation';
import { exportToDocx } from '@/lib/canvas/exportToDocx';
import { exportToPDF } from '@/lib/canvas/exportToPDF';
import { downloadFile } from '@/lib/canvas/downloadFile';

const TYPE_COLORS: Record<string, string> = {
  markdown: 'bg-info/10 text-info',
  python: 'bg-success/10 text-success',
  javascript: 'bg-warning/10 text-warning',
  typescript: 'bg-info/10 text-info',
  html: 'bg-primary/10 text-primary',
  css: 'bg-accent/10 text-accent',
  java: 'bg-destructive/10 text-destructive',
  cpp: 'bg-secondary text-foreground',
};

interface FileHeaderProps {
  filesCollapsed?: boolean;
  setFilesCollapsed?: (collapsed: boolean) => void;
}

export function FileHeader({ filesCollapsed = false, setFilesCollapsed }: FileHeaderProps = {}) {
  const { currentFile, saveStatus } = useCanvas();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentFile?.title || '');

  if (!currentFile) return null;

  const handleTitleSave = () => {
    // TODO: Call API to update title
    setIsEditingTitle(false);
  };

  const handleExport = async (format: 'docx' | 'pdf' | 'raw') => {
    if (!currentFile) return;
    
    switch (format) {
      case 'docx':
        await exportToDocx(currentFile);
        break;
      case 'pdf':
        await exportToPDF(currentFile);
        break;
      case 'raw':
        downloadFile(currentFile);
        break;
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleTitleSave} className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h2
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {currentFile.title}
            </h2>
            <Badge variant="secondary" className={TYPE_COLORS[currentFile.type]}>
              {currentFile.type.toUpperCase()}
            </Badge>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={cn(
                "flex items-center gap-1 text-sm",
                saveStatus === 'saved' && 'text-success',
                saveStatus === 'saving' && 'text-muted-foreground',
                saveStatus === 'error' && 'text-destructive'
              )}>
                {saveStatus === 'saving' && <Loader className="h-3 w-3 animate-spin" />}
                {saveStatus === 'saved' && <Check className="h-3 w-3" />}
                {saveStatus === 'error' && <X className="h-3 w-3" />}
                <span>{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save failed'}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <VersionNavigation />
        
        {/* Toggle Files Panel */}
        {setFilesCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilesCollapsed(!filesCollapsed)}
            title={filesCollapsed ? 'Show files panel' : 'Hide files panel'}
          >
            {filesCollapsed ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('docx')}>
              Export as DOCX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('raw')}>
              Download Raw File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
