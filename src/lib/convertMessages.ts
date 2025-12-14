import { Message } from "@langchain/langgraph-sdk";
import type { ThreadMessage } from "@assistant-ui/react";

/**
 * Convert LangGraph messages to @assistant-ui/react format
 */
export function convertLangGraphMessages(messages: Message[]): ThreadMessage[] {
  return messages.map((msg, index) => {
    const role = msg.type === "human" ? ("user" as const) : ("assistant" as const);
    
    // Handle different content types
    let content: any[];
    if (typeof msg.content === "string") {
      content = [{ type: "text" as const, text: msg.content }];
    } else if (Array.isArray(msg.content)) {
      content = msg.content.map((item: any) => {
        if (typeof item === "string") {
          return { type: "text" as const, text: item };
        }
        if (item.type === "text") {
          return { type: "text" as const, text: item.text };
        }
        // Handle tool calls
        if (item.type === "tool_use" || item.name) {
          return {
            type: "tool-call" as const,
            toolCallId: item.id || `tool-${index}`,
            toolName: item.name || "unknown",
            args: item.input || item.args || {},
            argsText: JSON.stringify(item.input || item.args || {}),
          };
        }
        return { type: "text" as const, text: String(item) };
      });
    } else {
      content = [{ type: "text" as const, text: String(msg.content) }];
    }

    const baseMessage = {
      id: msg.id || `msg-${index}`,
      role,
      content,
      createdAt: new Date(),
    };

    if (role === "user") {
      return {
        ...baseMessage,
        attachments: [],
      } as unknown as ThreadMessage;
    } else {
      return {
        ...baseMessage,
        metadata: {
          custom: {},
          unstable_state: null as any,
          unstable_annotations: [] as any,
          unstable_data: [] as any,
          steps: [] as any,
        },
        status: { type: "complete" as const, reason: "stop" as const },
      } as unknown as ThreadMessage;
    }
  });
}

/**
 * Convert @assistant-ui message to LangGraph format
 */
export function convertToLangGraphMessage(message: ThreadMessage): Message {
  const content = message.content
    .map((item) => {
      if (item.type === "text") {
        return item.text;
      }
      return "";
    })
    .join("");

  return {
    type: message.role === "user" ? "human" : "ai",
    content,
    id: message.id,
  } as Message;
}
