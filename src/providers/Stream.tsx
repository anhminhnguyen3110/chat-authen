import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { useThreads } from "./Thread";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCanvas } from "@/contexts/CanvasContext";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream> & {
  assistantId: string;
  setAssistantId: (value: string | null) => void;
};
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`);

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({
  children,
  assistantId,
  setAssistantId,
}: {
  children: ReactNode;
  assistantId: string;
  setAssistantId: (value: string | null) => void;
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const { data: session } = useSession();
  const { setCurrentFile, addVersion, setIsLoading } = useCanvas();
  
  // Get access token from session
  const accessToken = session?.accessToken;
  
  const streamValue = useTypedStream({
    apiUrl,
    assistantId,
    threadId: threadId ?? null,
    defaultHeaders: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    onCustomEvent: (event, options) => {
      options.mutate((prev) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    },
    onThreadId: (id) => {
      setThreadId(id);
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  useEffect(() => {
    checkGraphStatus(apiUrl).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code>.
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiUrl]);

  // Listen for file creation/updates from AI tool calls
  useEffect(() => {
    const messages = streamValue.messages || [];
    const lastMessage = messages[messages.length - 1];
    
    // Set loading state when AI is streaming
    if (streamValue.isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    
    if (lastMessage?.type === "ai" && "tool_calls" in lastMessage && lastMessage.tool_calls) {
      // Check if create_file or update_file was called
      const fileToolCalls = lastMessage.tool_calls.filter(
        (tc: any) => tc.name === "create_file" || tc.name === "update_file"
      );
      
      if (fileToolCalls.length > 0) {
        const latestToolCall = fileToolCalls[fileToolCalls.length - 1];
        
        if (latestToolCall.args) {
          const { file_type, title, content, file_id } = latestToolCall.args;
          
          if (content && title) {
            const newFile = {
              fileId: file_id || Date.now().toString(),
              threadId: threadId || "",
              type: file_type || "markdown",
              title: title,
              content: content,
              metadata: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            // If it's create_file, add as new version
            if (latestToolCall.name === "create_file") {
              addVersion(newFile);
            } else {
              // If it's update_file, also add as new version for history
              addVersion(newFile);
            }
          }
        }
      }
    }
  }, [streamValue.messages, streamValue.isLoading, threadId, setCurrentFile, addVersion, setIsLoading]);

  return (
    <StreamContext.Provider value={{ ...streamValue, assistantId, setAssistantId }}>
      {children}
    </StreamContext.Provider>
  );
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: "agent",
  });

  return (
    <StreamSession assistantId={assistantId || "agent"} setAssistantId={setAssistantId}>
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
