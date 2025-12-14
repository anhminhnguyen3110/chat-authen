"use client";

import { MessagePrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { MarkdownText as OriginalMarkdownText } from "./MarkdownText";

// Wrapper to match @assistant-ui TextMessagePartComponent type
const MarkdownText = (props: any) => {
  const text = props.part?.text || props.content || "";
  return <OriginalMarkdownText>{text}</OriginalMarkdownText>;
};

export function UserMessage() {
  return (
    <div className="flex gap-3 items-start justify-end">
      <div className="flex flex-col items-end max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            "bg-primary text-primary-foreground",
            "shadow-sm"
          )}
        >
          <MessagePrimitive.Content />
        </div>
      </div>
      <Avatar className="size-8 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 border border-primary/20">
          <User className="size-4 text-primary" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export function AssistantMessage() {
  return (
    <div className="flex gap-3 items-start">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarFallback className="bg-secondary border border-border">
          <Bot className="size-4 text-foreground/70" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-[80%]">
        <div className="rounded-2xl px-4 py-2.5 text-sm bg-card border border-border shadow-sm prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground">
          <MessagePrimitive.Content components={{ Text: MarkdownText }} />
        </div>
      </div>
    </div>
  );
}
