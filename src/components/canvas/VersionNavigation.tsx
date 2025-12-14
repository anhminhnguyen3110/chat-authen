'use client';

import React from 'react';
import { Forward } from 'lucide-react';
import { TooltipIconButton } from '@/components/ui/tooltip-icon-button';
import { useCanvas } from '@/contexts/CanvasContext';

export function VersionNavigation() {
  const { versionState, navigateVersion } = useCanvas();
  const { versions, currentIndex } = versionState;

  const isBackDisabled = currentIndex === 0;
  const isForwardDisabled = currentIndex === versions.length - 1;

  if (versions.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <TooltipIconButton
        tooltip={`Previous (${currentIndex}/${versions.length})`}
        side="left"
        variant="ghost"
        onClick={() => navigateVersion('prev')}
        disabled={isBackDisabled}
        className="h-8 w-8"
      >
        <Forward className="h-5 w-5 rotate-180" />
      </TooltipIconButton>

      <TooltipIconButton
        tooltip={`Next (${currentIndex + 2}/${versions.length})`}
        side="right"
        variant="ghost"
        onClick={() => navigateVersion('next')}
        disabled={isForwardDisabled}
        className="h-8 w-8"
      >
        <Forward className="h-5 w-5" />
      </TooltipIconButton>
    </div>
  );
}
