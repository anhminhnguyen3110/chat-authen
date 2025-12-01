import { Client } from "@langchain/langgraph-sdk";

export function createClient(apiUrl: string, accessToken: string | undefined) {
  return new Client({
    apiUrl,
    defaultHeaders: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
}
