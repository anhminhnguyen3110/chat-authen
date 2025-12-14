'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { CircleArrowUp, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SelectionBox, TextSelection } from '@/types/canvas';

interface FloatingInputBoxProps {
  isVisible: boolean;
  selectionBox: SelectionBox;
  selection: TextSelection | null;
  onSubmit: (message: string) => Promise<void>;
  onClose: () => void;
}

export const FloatingInputBox = forwardRef<HTMLDivElement, FloatingInputBoxProps>(
  ({ isVisible, selectionBox, selection, onSubmit, onClose }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      if (!isVisible) {
        setInputValue('');
      }
    }, [isVisible]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!inputValue.trim()) return;
      
      if (!selection) {
        toast.error('Selection error', {
          description: 'Failed to get selection indexes. Please try again.',
        });
        onClose();
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(inputValue);
        setInputValue('');
        onClose();
      } catch (error) {
        toast.error('Failed to send message');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className="absolute bg-card border border-border shadow-lg rounded-3xl p-2 flex gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={{
          top: `${selectionBox.top + 8}px`,
          left: `${selectionBox.left}px`,
          width: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-1">
          <Input
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Ask about this selection..."
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={!inputValue.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <CircleArrowUp className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    );
  }
);

FloatingInputBox.displayName = 'FloatingInputBox';
