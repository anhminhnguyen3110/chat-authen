"use client";

import React from "react";
import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
  useExternalMessageConverter,
  type AppendMessage,
} from "@assistant-ui/react";
import { useStreamContext } from "./Stream";
import { convertLangGraphMessages } from "@/lib/convertMessages";
import { Message } from "@langchain/langgraph-sdk";
import { v4 as uuidv4 } from "uuid";
import { ensureToolCallsHaveResponses } from "@/lib/ensureToolResponses";

export function AssistantRuntimeWrapper({ children }: { children: React.ReactNode }) {
  const stream = useStreamContext();

  const onNew = async (message: AppendMessage) => {
    if (message.content[0]?.type !== "text") {
      return;
    }

    const text = message.content[0].text;

    // Create new human message
    const newMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: text,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);

    // Submit through StreamContext
    await stream.submit(
      { messages: [...toolMessages, newMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [...(prev.messages ?? []), ...toolMessages, newMessage],
        }),
      }
    );
  };

  // Convert messages to assistant-ui format
  const threadMessages = useExternalMessageConverter({
    callback: convertLangGraphMessages,
    messages: [stream.messages], // Wrap in array as expected by useExternalMessageConverter
    isRunning: stream.isLoading,
  });

  // Create runtime
  const runtime = useExternalStoreRuntime({
    messages: threadMessages,
    isRunning: stream.isLoading,
    onNew,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
