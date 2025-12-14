"use client";

import { ThreadPrimitive } from "@assistant-ui/react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { Button } from "../ui/button";
import {
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
  PanelLeft,
  ArrowDown,
} from "lucide-react";
import { LangGraphLogoSVG } from "../icons/langgraph";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { Composer } from "./Composer";
import { UserMessage, AssistantMessage } from "./MessagePrimitives";
import ThreadHistory from "./history";
import { CanvasLayout } from "../canvas/CanvasLayout";
import { useCanvas } from "@/contexts/CanvasContext";
import { CreateFileDialog } from "./CreateFileDialog";
import { FileUploadDialog } from "./FileUploadDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { motion } from "framer-motion";

const ThreadScrollToBottom = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full"
      >
        <ArrowDown className="w-4 h-4" />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

export function Thread() {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false)
  );
  const [canvasOpen, setCanvasOpen] = useQueryState(
    "canvasOpen",
    parseAsBoolean.withDefault(false)
  );
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const { currentFile, loadThreadFiles } = useCanvas();

  // Load thread files
  useEffect(() => {
    if (threadId) {
      loadThreadFiles(threadId);
    }
  }, [threadId, loadThreadFiles]);

  // Auto-open canvas when file is created
  useEffect(() => {
    if (currentFile) {
      setCanvasOpen(true);
    }
  }, [currentFile, setCanvasOpen]);

  const chatStarted = !!threadId;

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Chat History Sidebar */}
      <div className="relative lg:flex hidden">
        <motion.div
          className="absolute h-full border-r border-border bg-background overflow-hidden"
          style={{ width: 300 }}
          animate={
            isLargeScreen
              ? { x: chatHistoryOpen ? 0 : -300 }
              : { x: chatHistoryOpen ? 0 : -300 }
          }
          initial={{ x: -300 }}
          transition={
            isLargeScreen
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0 }
          }
        >
          <div className="relative h-full" style={{ width: 300 }}>
            <ThreadHistory />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          chatHistoryOpen && isLargeScreen && "ml-[300px]"
        )}
      >
        {/* Header - Before Chat Started */}
        {!chatStarted && (
          <div className="absolute top-0 left-0 w-full flex items-center justify-between gap-3 p-2 pl-4 z-30 bg-background border-b border-border">
            <div className="flex items-center gap-2">
              {(!chatHistoryOpen || !isLargeScreen) && (
                <Button
                  className="hover:bg-secondary"
                  variant="ghost"
                  onClick={() => setChatHistoryOpen((p) => !p)}
                >
                  {chatHistoryOpen ? (
                    <PanelRightOpen className="size-5" />
                  ) : (
                    <PanelRightClose className="size-5" />
                  )}
                </Button>
              )}
            </div>
            <div className="absolute top-2 right-4 flex items-center gap-2">
              <TooltipIconButton
                tooltip="Open Canvas"
                variant="ghost"
                onClick={() => setCanvasOpen(true)}
              >
                <PanelLeft className="size-5" />
              </TooltipIconButton>
            </div>
          </div>
        )}

        {/* Header - After Chat Started */}
        {chatStarted && (
          <div className="flex items-center justify-between gap-3 p-3 border-b border-border z-30 bg-background flex-shrink-0">
            <div className="flex items-center justify-start gap-2">
              {(!chatHistoryOpen || !isLargeScreen) && (
                <Button
                  className="hover:bg-secondary"
                  variant="ghost"
                  onClick={() => setChatHistoryOpen((p) => !p)}
                >
                  {chatHistoryOpen ? (
                    <PanelRightOpen className="size-5" />
                  ) : (
                    <PanelRightClose className="size-5" />
                  )}
                </Button>
              )}
              <button
                className="flex gap-2 items-center cursor-pointer"
                onClick={() => setThreadId(null)}
              >
                <LangGraphLogoSVG width={32} height={32} />
                <span className="text-xl font-semibold tracking-tight">
                  Agent Chat
                </span>
              </button>
              {threadId && (
                <div className="flex gap-2 ml-2">
                  <CreateFileDialog threadId={threadId} />
                  <FileUploadDialog threadId={threadId} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <TooltipIconButton
                tooltip="Open Canvas"
                variant="ghost"
                onClick={() => setCanvasOpen(true)}
              >
                <PanelLeft className="size-5" />
              </TooltipIconButton>
              <TooltipIconButton
                tooltip="New thread"
                variant="ghost"
                onClick={() => setThreadId(null)}
              >
                <SquarePen className="size-5" />
              </TooltipIconButton>
            </div>
          </div>
        )}

        {/* Chat Thread or Canvas */}
        {!canvasOpen && (
          <ThreadPrimitive.Root className="flex-1 flex flex-col overflow-hidden">
            <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4">
              <div
                className={cn(
                  "max-w-3xl mx-auto flex flex-col gap-4 w-full",
                  !chatStarted ? "pt-[25vh] pb-8" : "py-8"
                )}
              >
                {!chatStarted && (
                  <div className="flex flex-col items-center gap-4 mb-8">
                    <LangGraphLogoSVG className="h-12" />
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                      Agent Chat
                    </h1>
                    <p className="text-muted-foreground text-center">
                      Start a conversation with the AI assistant
                    </p>
                  </div>
                )}

                <ThreadPrimitive.Messages
                  components={{
                    UserMessage: UserMessage,
                    AssistantMessage: AssistantMessage,
                  }}
                />
              </div>
            </ThreadPrimitive.Viewport>

            <div className="border-t border-border bg-background p-4">
              <div className="max-w-3xl mx-auto">
                <Composer />
              </div>
            </div>

            <ThreadScrollToBottom />
          </ThreadPrimitive.Root>
        )}

        {canvasOpen && threadId && (
          <CanvasLayout
            chatPanel={
              <ThreadPrimitive.Root className="h-full flex flex-col">
                <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4 py-8">
                  <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <ThreadPrimitive.Messages
                      components={{
                        UserMessage: UserMessage,
                        AssistantMessage: AssistantMessage,
                      }}
                    />
                  </div>
                </ThreadPrimitive.Viewport>
                <div className="border-t border-border bg-background p-4">
                  <div className="max-w-2xl mx-auto">
                    <Composer />
                  </div>
                </div>
              </ThreadPrimitive.Root>
            }
            threadId={threadId}
          />
        )}
      </div>

      {/* Toggle Canvas Button */}
      {!canvasOpen && currentFile && (
        <div className="fixed bottom-20 right-6 z-50">
          <TooltipIconButton
            tooltip="Open Canvas"
            onClick={() => setCanvasOpen(true)}
            className="shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 size-12"
          >
            <PanelLeft className="size-6" />
          </TooltipIconButton>
        </div>
      )}
    </div>
  );
}
