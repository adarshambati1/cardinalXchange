import type { UIMessage } from "ai";

import { replaceAiChatMessages } from "@/server/cxc-ai/services/chat.service";
import {
  HttpError,
  jsonError,
  jsonOk,
  readPayload,
} from "@/server/http/http";

type RouteContext = {
  params: Promise<{ chatId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const payload = await readPayload(request);
    const messages = parseMessages(payload.messages);
    const snapshot = await replaceAiChatMessages(chatId, messages);
    return jsonOk(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}

function parseMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, "invalid_messages", "messages must be an array.");
  }

  return value.filter(isUiMessage);
}

function isUiMessage(value: unknown): value is UIMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Partial<UIMessage>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant" || message.role === "system") &&
    Array.isArray(message.parts)
  );
}

