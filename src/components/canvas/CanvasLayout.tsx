'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Canvas } from './index';
import { FilesPanel } from './FilesPanel';

interface CanvasLayoutProps {
  chatPanel: React.ReactNode;
  threadId?: string;
}

const CHAT_COLLAPSED_QUERY_PARAM = 'chatCollapsed';

export function CanvasLayout({ chatPanel, threadId }: CanvasLayoutProps) {
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [filesCollapsed, setFilesCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const chatCollapsedSearchParam = searchParams.get(CHAT_COLLAPSED_QUERY_PARAM);
  
  useEffect(() => {
    try {
      if (chatCollapsedSearchParam) {
        setChatCollapsed(JSON.parse(chatCollapsedSearchParam));
      }
    } catch {
      setChatCollapsed(false);
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.delete(CHAT_COLLAPSED_QUERY_PARAM);
      router.replace(`?${queryParams.toString()}`, { scroll: false });
    }
  }, [chatCollapsedSearchParam, searchParams, router]);

  const updateChatCollapsed = (collapsed: boolean) => {
    setChatCollapsed(collapsed);
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set(CHAT_COLLAPSED_QUERY_PARAM, JSON.stringify(collapsed));
    router.replace(`?${queryParams.toString()}`, { scroll: false });
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {!chatCollapsed && (
        <>
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            maxSize={50}
            className="transition-all duration-300 h-screen bg-background/70"
            id="chat-panel"
            order={1}
          >
            {chatPanel}
          </ResizablePanel>
          <ResizableHandle />
        </>
      )}
      
      <ResizablePanel
        defaultSize={chatCollapsed ? (filesCollapsed ? 100 : 75) : 50}
        maxSize={80}
        minSize={30}
        id="canvas-panel"
        order={2}
        className="flex flex-col w-full overflow-hidden"
      >
        <Canvas 
          chatCollapsed={chatCollapsed} 
          setChatCollapsed={updateChatCollapsed}
          filesCollapsed={filesCollapsed}
          setFilesCollapsed={setFilesCollapsed}
        />
      </ResizablePanel>

      {!filesCollapsed && (
        <>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="transition-all duration-300 h-screen bg-secondary border-l border-border overflow-hidden"
            id="files-panel"
            order={3}
          >
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border bg-card flex-shrink-0">
                <h3 className="font-semibold text-sm">Thread Files</h3>
              </div>
              <div className="flex-1 overflow-auto">
                {threadId ? (
                  <FilesPanel threadId={threadId} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No thread selected
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
