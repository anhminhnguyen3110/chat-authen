'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CanvasFile, TextSelection, VersionState, ArtifactV3, FileUploadResponse } from '@/types/canvas';
import { debounce } from 'lodash';

interface CanvasContextValue {
  currentFile: CanvasFile | null;
  setCurrentFile: (file: CanvasFile | null) => void;
  updateFileContent: (content: string) => void;
  
  // Artifact V3 versioning
  artifact: ArtifactV3 | undefined;
  setArtifact: (artifact: ArtifactV3 | undefined) => void;
  setSelectedArtifact: (index: number) => void;
  isArtifactSaved: boolean;
  artifactUpdateFailed: boolean;
  
  // Legacy version state (keep for backward compatibility)
  versionState: VersionState;
  navigateVersion: (direction: 'prev' | 'next') => void;
  addVersion: (file: CanvasFile) => void;
  
  selection: TextSelection | null;
  setSelection: (selection: TextSelection | null) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  saveStatus: 'saved' | 'saving' | 'error' | null;
  setSaveStatus: (status: 'saved' | 'saving' | 'error' | null) => void;
  
  saveFile: () => Promise<void>;
  createFile: (params: { threadId: string; title: string; type: 'code' | 'markdown'; language?: string }) => Promise<void>;
  uploadFile: (threadId: string, file: File) => Promise<FileUploadResponse>;
  loadThreadFiles: (threadId: string) => Promise<CanvasFile[]>;
  threadFiles: CanvasFile[];
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [currentFile, setCurrentFile] = useState<CanvasFile | null>(null);
  const [threadFiles, setThreadFiles] = useState<CanvasFile[]>([]);
  const [versionState, setVersionState] = useState<VersionState>({
    versions: [],
    currentIndex: 0,
  });
  
  // Artifact V3 state
  const [artifact, setArtifact] = useState<ArtifactV3 | undefined>();
  const [isArtifactSaved, setIsArtifactSaved] = useState(true);
  const [artifactUpdateFailed, setArtifactUpdateFailed] = useState(false);
  const lastSavedArtifact = useRef<ArtifactV3 | undefined>(undefined);
  
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Debounced save artifact
  const debouncedSaveArtifact = useRef(
    debounce(async (artifactToSave: ArtifactV3) => {
      setArtifactUpdateFailed(false);
      try {
        // TODO: Call API to save artifact
        // await saveArtifactToAPI(artifactToSave);
        setIsArtifactSaved(true);
        lastSavedArtifact.current = artifactToSave;
      } catch (error) {
        console.error('Failed to save artifact:', error);
        setArtifactUpdateFailed(true);
      }
    }, 5000)
  ).current;

  // Auto-save artifact when it changes
  useEffect(() => {
    if (!artifact) return;
    if (
      !lastSavedArtifact.current ||
      lastSavedArtifact.current.contents !== artifact.contents
    ) {
      setIsArtifactSaved(false);
      debouncedSaveArtifact(artifact);
    }
  }, [artifact, debouncedSaveArtifact]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSaveArtifact.cancel();
    };
  }, [debouncedSaveArtifact]);

  const setSelectedArtifact = useCallback((index: number) => {
    setArtifact(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentIndex: index
      };
    });
  }, []);

  const addVersion = useCallback((file: CanvasFile) => {
    setVersionState(prev => ({
      versions: [...prev.versions, file],
      currentIndex: prev.versions.length,
    }));
    setCurrentFile(file);
  }, []);

  const navigateVersion = useCallback((direction: 'prev' | 'next') => {
    setVersionState(prev => {
      const newIndex = direction === 'prev' 
        ? Math.max(0, prev.currentIndex - 1)
        : Math.min(prev.versions.length - 1, prev.currentIndex + 1);
      
      if (newIndex !== prev.currentIndex && prev.versions[newIndex]) {
        setCurrentFile(prev.versions[newIndex]);
      }
      
      return {
        ...prev,
        currentIndex: newIndex,
      };
    });
  }, []);

  const updateFileContent = useCallback((content: string) => {
    setCurrentFile(prev => {
      if (!prev) return null;
      return { ...prev, content };
    });
  }, []);

  const saveFile = useCallback(async () => {
    if (!currentFile) return;
    
    setSaveStatus('saving');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files/${currentFile.fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentFile.content,
          title: currentFile.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      setSaveStatus('saved');
      
      // Reset to null after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus('error');
      
      // Reset to null after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [currentFile]);

  const createFile = useCallback(async (params: { 
    threadId: string; 
    title: string; 
    type: 'code' | 'markdown'; 
    language?: string 
  }) => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: params.threadId,
          title: params.title,
          type: params.type,
          content: '',
          language: params.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create file');
      }

      const data = await response.json();
      
      // Convert snake_case to camelCase
      const file: CanvasFile = {
        fileId: data.file_id,
        threadId: data.thread_id,
        type: data.type,
        title: data.title,
        content: data.content,
        language: data.language,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      
      setCurrentFile(file);
      setThreadFiles(prev => [...prev, file]);
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (threadId: string, file: File): Promise<FileUploadResponse> => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('thread_id', threadId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files/upload?thread_id=${threadId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload file');
      }

      const data = await response.json();
      
      // Refresh thread files
      await loadThreadFiles(threadId);
      
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadThreadFiles = useCallback(async (threadId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/files/threads/${threadId}/files`);
      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      
      // Convert snake_case to camelCase
      const files: CanvasFile[] = data.files.map((f: any) => ({
        fileId: f.file_id,
        threadId: f.thread_id,
        type: f.type,
        title: f.title,
        content: f.content,
        filePath: f.file_path,
        language: f.language || f.metadata?.language,
        metadata: f.metadata,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));
      
      setThreadFiles(files);
      return files;
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  }, []);

  const value: CanvasContextValue = {
    currentFile,
    setCurrentFile,
    updateFileContent,
    artifact,
    setArtifact,
    setSelectedArtifact,
    isArtifactSaved,
    artifactUpdateFailed,
    versionState,
    navigateVersion,
    addVersion,
    selection,
    setSelection,
    isLoading,
    setIsLoading,
    saveStatus,
    setSaveStatus,
    saveFile,
    createFile,
    uploadFile,
    loadThreadFiles,
    threadFiles,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
}
