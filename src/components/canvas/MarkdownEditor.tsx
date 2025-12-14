'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useCanvas } from '@/contexts/CanvasContext';
import { Button } from '@/components/ui/button';
import { Eye, Code } from 'lucide-react';

export function MarkdownEditor() {
  const { currentFile, updateFileContent } = useCanvas();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  if (!currentFile || currentFile.type !== 'markdown') return null;

  const handleChange = (value: string) => {
    if (currentFile) {
      updateFileContent(value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end gap-2 p-2 border-b">
        <Button
          variant={mode === 'edit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('edit')}
        >
          <Code className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant={mode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('preview')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {mode === 'edit' ? (
          <Textarea
            value={currentFile.content}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-full font-mono text-sm resize-none"
            placeholder="Write your markdown here..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {currentFile.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
