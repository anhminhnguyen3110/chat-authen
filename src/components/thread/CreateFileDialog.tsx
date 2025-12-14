'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePlus, FileCode, FileText } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';
import { toast } from 'sonner';

interface CreateFileDialogProps {
  threadId: string;
  onFileCreated?: () => void;
  variant?: 'default' | 'ghost';
}

export function CreateFileDialog({ threadId, onFileCreated, variant = 'default' }: CreateFileDialogProps) {
  const { createFile } = useCanvas();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'code' | 'markdown'>('code');
  const [language, setLanguage] = useState('typescript');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      setIsCreating(true);
      await createFile({
        threadId,
        title: title.trim(),
        type,
        language: type === 'code' ? language : undefined,
      });

      toast.success(`${type === 'code' ? 'Code' : 'Markdown'} file created!`);
      setOpen(false);
      setTitle('');
      onFileCreated?.();
    } catch (error) {
      toast.error('Failed to create file');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'ghost' ? (
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <FilePlus className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" size="sm" className="gap-2">
            <FilePlus className="size-4" />
            Create New File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Create a new code or markdown file in this thread
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">File Name</Label>
            <Input
              id="title"
              placeholder="e.g., MyComponent.tsx or README.md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">File Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'code' | 'markdown')}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">
                  <div className="flex items-center gap-2">
                    <FileCode className="size-4" />
                    Code File
                  </div>
                </SelectItem>
                <SelectItem value="markdown">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4" />
                    Markdown File
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'code' && (
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create File'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
