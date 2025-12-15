'use client';

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { useCanvas } from '@/contexts/CanvasContext';
import { FileType } from '@/types/canvas';

const LANGUAGE_EXTENSIONS: Record<FileType, any> = {
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  html: html(),
  css: css(),
  java: java(),
  cpp: cpp(),
  markdown: [],
};

export function CodeEditor() {
  const { currentFile, updateFileContent } = useCanvas();

  if (!currentFile || currentFile.type === 'markdown') return null;

  const handleChange = (value: string) => {
    if (currentFile) {
      updateFileContent(value);
    }
  };

  // Use language field for code files, fallback to type for backward compatibility
  const languageKey = (currentFile.language || currentFile.type) as FileType;
  const extension = LANGUAGE_EXTENSIONS[languageKey] || [];

  return (
    <div className="h-full overflow-auto">
      <CodeMirror
        value={currentFile.content}
        height="100%"
        extensions={Array.isArray(extension) ? extension : [extension]}
        onChange={handleChange}
        theme="light"
        className="text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
}
