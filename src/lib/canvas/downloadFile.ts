import { saveAs } from 'file-saver';
import { CanvasFile } from '@/types/canvas';

const FILE_EXTENSIONS: Record<string, string> = {
  markdown: '.md',
  python: '.py',
  javascript: '.js',
  typescript: '.ts',
  html: '.html',
  css: '.css',
  java: '.java',
  cpp: '.cpp',
};

export function downloadFile(file: CanvasFile) {
  // For code files, use language field; for markdown use type
  const languageKey = file.type === 'code' ? (file.language || 'python') : file.type;
  const extension = FILE_EXTENSIONS[languageKey] || '';
  
  // If file already has extension in title, use as-is
  const hasExtension = /\.\w+$/.test(file.title);
  const filename = hasExtension ? file.title : `${file.title}${extension}`;
  
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}
