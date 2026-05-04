import type { AiChatSessionRecord } from "@cardinalxchange/db";
import {
  createAiChatSessionRecord,
  ensureAiChatSessionRecord,
  getAiChatSessionRecord,
  listAiChatSessionRecords,
  replaceAiChatSessionMessages,
} from "@cardinalxchange/db";

import type {
  AiChatMessage,
  AiChatSource,
  AiChatSession,
  AiChatSnapshot,
} from "@/server/http/contracts";

export async function createAiChatSession(title = "New CXC AI chat"): Promise<AiChatSession> {
  const record = await createAiChatSessionRecord(title);
  return toSessionDto(record);
}

export async function ensureAiChatSession(
  chatId: string,
  messages: AiChatMessage[] = [],
): Promise<AiChatSession> {
  const record = await ensureAiChatSessionRecord(chatId, inferTitle(messages));
  return toSessionDto(record);
}

export async function getAiChatSnapshot(chatId: string): Promise<AiChatSnapshot> {
  const record = await getAiChatSessionRecord(chatId);
  if (!record) {
    const session = await ensureAiChatSession(chatId);
    return { session, messages: [] };
  }

  return {
    session: toSessionDto(record),
    messages: record.messages.map(toMessageDto),
  };
}

export async function listAiChatSessions(): Promise<AiChatSession[]> {
  const records = await listAiChatSessionRecords();
  return records.map(toSessionDto);
}

export async function replaceAiChatMessages(
  chatId: string,
  messages: AiChatMessage[],
  sources?: AiChatSource[],
): Promise<AiChatSnapshot> {
  const record = await replaceAiChatSessionMessages(
    chatId,
    inferTitle(messages),
    messages.map(toPersistedMessageInput),
    sources?.map(toPersistedSourceInput),
  );

  return {
    session: toSessionDto(record),
    messages: record.messages.map(toMessageDto),
  };
}

function toSessionDto(record: AiChatSessionRecord): AiChatSession {
  return {
    id: record.id,
    title: record.title ?? "New CXC AI chat",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    messageCount: record.messages.length,
  };
}

function inferTitle(messages: AiChatMessage[]): string {
  const firstUserText = messages
    .find((message) => message.role === "user")
    ?.parts.map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();

  if (!firstUserText) {
    return "New CXC AI chat";
  }

  return firstUserText.length > 60 ? `${firstUserText.slice(0, 57)}...` : firstUserText;
}

function toPersistedMessageInput(message: AiChatMessage) {
  return {
    uiMessageId: message.id,
    role: message.role,
    content: extractText(message),
    parts: message.parts,
  };
}

function toPersistedSourceInput(source: AiChatSource) {
  return {
    id: source.id,
    kind: source.kind,
    title: source.title,
    url: source.url,
    snippet: source.snippet,
    sourceQuestionId: source.questionId,
    sourceAnswerId: source.answerId,
  };
}

function toMessageDto(
  message: AiChatSessionRecord["messages"][number],
): AiChatMessage {
  const role = message.role.toLowerCase() as AiChatMessage["role"];
  const parts = Array.isArray(message.parts)
    ? (message.parts as AiChatMessage["parts"])
    : textParts(message.content);

  return {
    id: message.uiMessageId ?? message.id,
    role,
    parts,
  };
}

function extractText(message: AiChatMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .trim();
}

function textParts(content: string): AiChatMessage["parts"] {
  if (!content) {
    return [];
  }

  return [{ type: "text", text: content }];
}
