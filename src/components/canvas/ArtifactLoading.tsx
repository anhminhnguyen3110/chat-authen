'use client';

import React from 'react';
import { Loader } from 'lucide-react';

export function ArtifactLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in duration-500 p-8">
      <div className="relative">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground">Generating...</p>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
      
      {/* Skeleton */}
      <div className="w-full max-w-2xl space-y-3 mt-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  );
}
