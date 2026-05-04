import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";

import {
  buildCxcAiSystemPrompt,
  buildFallbackAnswer,
  createCxcAiTools,
  cxcAiModelName,
  cxcAiStopWhen,
  getLatestUserText,
} from "@/server/cxc-ai/agents/cxc.agent";
import { retrievePublicQuestionAnswerSources } from "@/server/cxc-ai/services/retrieval.service";
import { replaceAiChatMessages } from "@/server/cxc-ai/services/chat.service";
import { HttpError } from "@/server/http/http";

export const maxDuration = 30;

type ChatPayload = {
  id?: unknown;
  messages?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatPayload;
    const chatId = parseChatId(payload.id);
    const messages = parseMessages(payload.messages);
    const latestUserText = getLatestUserText(messages);
    const sources = await retrievePublicQuestionAnswerSources({
      query: latestUserText,
      limit: 6,
    });

    await replaceAiChatMessages(chatId, messages, sources);

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          sources.forEach((source) => {
            writer.write({
              type: "source-url",
              sourceId: source.id,
              url: source.url,
              title: `${source.label}: ${source.title}`,
            });
          });

          if (!process.env.OPENAI_API_KEY) {
            const textId = `fallback-${Date.now().toString(36)}`;
            writer.write({ type: "text-start", id: textId });
            writer.write({
              type: "text-delta",
              id: textId,
              delta: buildFallbackAnswer(latestUserText, sources),
            });
            writer.write({ type: "text-end", id: textId });
            return;
          }

          const result = streamText({
            model: openai(cxcAiModelName),
            system: buildCxcAiSystemPrompt(sources),
            messages: await convertToModelMessages(messages),
            tools: createCxcAiTools(),
            stopWhen: cxcAiStopWhen,
            maxOutputTokens: 900,
          });

          writer.merge(result.toUIMessageStream());
        },
      }),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    }

    return Response.json(
      { error: "cxc_ai_chat_failed", message: "CXC AI chat failed." },
      { status: 500 },
    );
  }
}

function parseChatId(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "missing_chat_id", "chat id is required.");
  }

  return value.trim().slice(0, 120);
}

function parseMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, "invalid_messages", "messages must be an array.");
  }

  const messages = value.filter(isUiMessage);
  if (messages.length === 0) {
    throw new HttpError(400, "invalid_messages", "at least one message is required.");
  }

  return messages;
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
