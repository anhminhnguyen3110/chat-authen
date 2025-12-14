import { useState, useCallback, useRef } from 'react';

interface HistoryEntry {
  content: string;
  timestamp: number;
}

interface UseFileHistoryReturn {
  currentContent: string;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (content: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clearHistory: () => void;
}

/**
 * Custom hook for managing file content history (undo/redo)
 */
export function useFileHistory(initialContent: string = ''): UseFileHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { content: initialContent, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const currentContent = history[currentIndex]?.content || '';
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushHistory = useCallback((content: string) => {
    // Skip if this is from undo/redo action
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ content, timestamp: Date.now() });
      
      // Limit history to 100 entries
      if (newHistory.length > 100) {
        return newHistory.slice(-100);
      }
      
      return newHistory;
    });
    
    setCurrentIndex((prev) => Math.min(prev + 1, 99));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (!canUndo) return null;
    
    isUndoRedoAction.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex].content;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return null;
    
    isUndoRedoAction.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex].content;
  }, [canRedo, currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([{ content: '', timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, []);

  return {
    currentContent,
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    clearHistory,
  };
}
