'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCanvas } from '@/contexts/CanvasContext';
import { useStreamContext } from '@/providers/Stream';
import { CodeEditor } from './CodeEditor';
import { MarkdownEditor } from './MarkdownEditor';
import { FileHeader } from './FileHeader';
import { ArtifactHeader } from '@/components/artifacts/header';
import { AskOpenCanvas } from '@/components/artifacts/components/AskOpenCanvas';
import { ArtifactLoading } from './ArtifactLoading';
import { SelectionBox, ArtifactV3 } from '@/types/canvas';
import { calculateSelectionIndexes } from './utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useFileHistory } from '@/hooks/useFileHistory';
import { v4 as uuidv4 } from 'uuid';
import { ensureToolCallsHaveResponses } from '@/lib/ensureToolResponses';
import type { Message } from '@langchain/langgraph-sdk';

interface CanvasProps {
  chatCollapsed?: boolean;
  setChatCollapsed?: (collapsed: boolean) => void;
  filesCollapsed?: boolean;
  setFilesCollapsed?: (collapsed: boolean) => void;
}

export function Canvas({ 
  chatCollapsed = false, 
  setChatCollapsed,
  filesCollapsed = false,
  setFilesCollapsed 
}: CanvasProps) {
  const { 
    currentFile, 
    updateFileContent,
    selection, 
    setSelection, 
    isLoading,
    saveFile,
    artifact,
    setSelectedArtifact,
    isArtifactSaved,
    artifactUpdateFailed,
  } = useCanvas();
  const stream = useStreamContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const artifactContentRef = useRef<HTMLDivElement>(null);
  
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectionIndexes, setSelectionIndexes] = useState<{
    start: number;
    end: number;
  }>();
  
  // History management
  const { canUndo, canRedo, pushHistory, undo, redo } = useFileHistory(currentFile?.content);

  // Auto-save with 5 second debounce
  const debouncedSave = useDebounce(() => {
    saveFile();
  }, 5000);

  // Track content changes for auto-save
  useEffect(() => {
    if (currentFile?.content) {
      debouncedSave();
    }
  }, [currentFile?.content, debouncedSave]);

  const handleMouseUp = useCallback(() => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.rangeCount === 0) return;

    const range = windowSelection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (!selectedText || !contentRef.current || !currentFile) return;

    // Validate selection is within canvas (artifact content)
    const isWithinArtifact = (node: Node | null): boolean => {
      if (!node) return false;
      if (node === artifactContentRef.current || node === contentRef.current) return true;
      return isWithinArtifact(node.parentNode);
    };

    const startInArtifact = isWithinArtifact(range.startContainer);
    const endInArtifact = isWithinArtifact(range.endContainer);

    if (!startInArtifact || !endInArtifact) return;

    // Calculate position
    const rects = range.getClientRects();
    const firstRect = rects[0];
    const lastRect = rects[rects.length - 1];
    const contentRect = contentRef.current.getBoundingClientRect();

    const boxWidth = 400;
    const padding = 16;
    
    let left = lastRect.right - contentRect.left - boxWidth;
    if (left < padding) {
      left = Math.max(padding, firstRect.left - contentRect.left);
    }
    const maxLeft = contentRect.width - boxWidth - padding;
    left = Math.min(left, maxLeft);

    setSelectionBox({
      top: lastRect.bottom - contentRect.top,
      left,
      text: selectedText,
    });

    // Calculate character indexes
    const indexes = calculateSelectionIndexes(currentFile.content, selectedText, range);
    
    setSelection({
      text: selectedText,
      startIndex: indexes.start,
      endIndex: indexes.end,
    });

    setSelectionIndexes({
      start: indexes.start,
      end: indexes.end,
    });

    setIsInputVisible(false);
  }, [currentFile, setSelection]);

  const handleSubmitMessage = async (message: string) => {
    if (!selection || !currentFile) return;
    
    // Create message with highlighted code context
    const messageWithContext = `Regarding this code:\n\`\`\`\n${selection.text}\n\`\`\`\n\n${message}`;
    
    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: messageWithContext,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    
    // Submit to stream with highlighted code context
    stream.submit(
      { messages: [...toolMessages, newHumanMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );
    
    // Close the selection
    handleCleanupState();
  };

  const handleCleanupState = useCallback(() => {
    setIsInputVisible(false);
    setSelectionBox(null);
    setSelection(null);
    setSelectionIndexes(undefined);
    setInputValue("");
  }, [setSelection]);

  const handleSelectionBoxMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleClose = useCallback(() => {
    handleCleanupState();
  }, [handleCleanupState]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectionBoxRef.current &&
        !selectionBoxRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        handleCleanupState();
      }
    };

    if (selectionBox) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectionBox, handleCleanupState]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y / Cmd+Shift+Z: Redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Track history when content changes
  const prevContentRef = useRef<string>('');
  useEffect(() => {
    if (currentFile?.content && currentFile.content !== prevContentRef.current) {
      prevContentRef.current = currentFile.content;
      pushHistory(currentFile.content);
    }
  }, [currentFile?.content, pushHistory]);

  // Loading state
  if (isLoading) {
    return <ArtifactLoading />;
  }

  if (!currentFile && !artifact) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No file open</p>
          <p className="text-sm mt-1">Create a file to get started</p>
        </div>
      </div>
    );
  }

  // Get current artifact content for header
  const getCurrentArtifactContent = () => {
    if (!artifact || !artifact.contents.length) return null;
    return artifact.contents.find(c => c.index === artifact.currentIndex) || artifact.contents[0];
  };

  const currentArtifactContent = getCurrentArtifactContent();
  const showArtifactHeader = artifact && currentArtifactContent;

  return (
    <div className="h-full flex flex-col bg-card" ref={contentRef}>
      {showArtifactHeader && setChatCollapsed ? (
        <ArtifactHeader
          isBackwardsDisabled={artifact.currentIndex === 1}
          isForwardDisabled={artifact.currentIndex === artifact.contents.length}
          setSelectedArtifact={setSelectedArtifact}
          currentArtifactContent={currentArtifactContent}
          isArtifactSaved={isArtifactSaved}
          totalArtifactVersions={artifact.contents.length}
          artifactUpdateFailed={artifactUpdateFailed}
          chatCollapsed={chatCollapsed}
          setChatCollapsed={setChatCollapsed}
        />
      ) : (
        <FileHeader filesCollapsed={filesCollapsed} setFilesCollapsed={setFilesCollapsed} />
      )}
      
      <div className="flex-1 relative" onMouseUp={handleMouseUp} ref={artifactContentRef}>
        {currentFile?.type === 'markdown' ? <MarkdownEditor /> : <CodeEditor />}

        {selectionBox && artifact && (
          <AskOpenCanvas
            ref={selectionBoxRef}
            isInputVisible={isInputVisible}
            selectionBox={selectionBox}
            setIsInputVisible={setIsInputVisible}
            handleSubmitMessage={handleSubmitMessage}
            handleSelectionBoxMouseDown={handleSelectionBoxMouseDown}
            artifact={artifact}
            selectionIndexes={selectionIndexes}
            handleCleanupState={handleCleanupState}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        )}
      </div>
    </div>
  );
}
