"use client";

import { ComposerPrimitive, useThreadRuntime } from "@assistant-ui/react";
import { SendHorizontalIcon } from "lucide-react";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";

export function Composer() {
  const runtime = useThreadRuntime();
  const isRunning = runtime.isRunning;

  return (
    <ComposerPrimitive.Root className="flex w-full min-h-[64px] flex-col items-center justify-center border border-border rounded-2xl px-3 py-2 shadow-sm transition-colors bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <ComposerPrimitive.Input
        autoFocus
        placeholder="Type your message..."
        className="w-full resize-none bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground text-sm text-foreground"
        rows={1}
      />
      
      <div className="flex items-center justify-end w-full mt-2 gap-2">
        {isRunning ? (
          <ComposerPrimitive.Cancel asChild>
            <TooltipIconButton
              tooltip="Cancel"
              variant="ghost"
              className="h-8 px-3 hover:bg-secondary"
            >
              <span className="text-sm">Cancel</span>
            </TooltipIconButton>
          </ComposerPrimitive.Cancel>
        ) : (
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              variant="default"
              className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <SendHorizontalIcon className="w-4 h-4" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        )}
      </div>
    </ComposerPrimitive.Root>
  );
}
