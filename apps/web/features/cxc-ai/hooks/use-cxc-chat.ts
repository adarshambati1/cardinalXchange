"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo } from "react";

import type { CxcMessageDto } from "@/server/http/contracts";

type UseCxcChatArgs = {
  chatId: string;
  initialMessages: CxcMessageDto[];
};

/**
 * Wraps the AI SDK's `useChat` with CXC-specific transport + persistence
 * hooks. The route handler at `/api/cxc-ai` already persists the user-side
 * message before streaming; we POST the finished assistant turn to
 * `/api/cxc-ai/chats/[chatId]/messages` once the stream settles so a refresh
 * resumes the conversation.
 */
export function useCxcChat({ chatId, initialMessages }: UseCxcChatArgs) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/cxc-ai",
        prepareSendMessagesRequest({ id, messages }) {
          return { body: { id, messages } };
        },
      }),
    [],
  );

  const chat = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    onFinish: ({ messages: finishedMessages }) => {
      void fetch(
        `/api/cxc-ai/chats/${encodeURIComponent(chatId)}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: finishedMessages }),
        },
      );
    },
  });

  return chat;
}

export type UseCxcChatReturn = ReturnType<typeof useCxcChat>;
