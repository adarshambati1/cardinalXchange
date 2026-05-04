import { stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";

import type { AiChatSource, AskCommunityDraft } from "@/server/http/contracts";
import { retrievePublicQuestionAnswerSources } from "@/server/cxc-ai/services/retrieval.service";

export const cxcAiModelName = process.env.OPENAI_MODEL ?? "gpt-5-mini";
export const cxcAiMaxDuration = 30;
export const cxcAiStopWhen = stepCountIs(3);

export function buildCxcAiSystemPrompt(sources: AiChatSource[]): string {
  return [
    "You are CXC AI, CardinalXchange's Q&A assistant.",
    "Use only public CardinalXchange Questions and Answers supplied in context or returned by tools.",
    "Do not claim access to private student data, unpublished posts, auth state, or package/database internals.",
    "Label sources inline using their labels, such as [Question: ...] or [Answer: ...].",
    "If the sources are thin or missing, say what is missing and recommend asking the community.",
    "The Ask the Community tool may draft a title, body, and tags only. It must never post automatically.",
    "",
    "Initial public CardinalXchange context:",
    formatSourcesForPrompt(sources),
  ].join("\n");
}

export function createCxcAiTools() {
  return {
    search_cxc_sources: tool({
      description:
        "Search read-only public CardinalXchange Questions and Answers for source-backed context.",
      inputSchema: z.object({
        query: z.string().min(1).max(240),
        tags: z.array(z.string().min(1).max(64)).max(8).optional(),
      }),
      execute: async ({ query, tags }) => ({
        sources: await retrievePublicQuestionAnswerSources({ query, tags, limit: 6 }),
      }),
    }),
    ask_community_draft: tool({
      description:
        "Draft a transient Ask the Community post. This returns title/body/tags only and never posts.",
      inputSchema: z.object({
        title: z.string().min(1).max(180),
        body: z.string().min(1).max(2000),
        tags: z.array(z.string().min(1).max(64)).min(1).max(8),
      }),
      execute: async (draft): Promise<AskCommunityDraft> => ({
        title: draft.title,
        body: draft.body,
        tags: draft.tags,
      }),
    }),
  };
}

export function getLatestUserText(messages: UIMessage[]): string {
  return (
    [...messages]
      .reverse()
      .find((message) => message.role === "user")
      ?.parts.map((part) => (part.type === "text" ? part.text : ""))
      .join(" ")
      .trim() ?? ""
  );
}

export function buildFallbackAnswer(userText: string, sources: AiChatSource[]): string {
  if (sources.length === 0) {
    return [
      "I do not have enough public CardinalXchange question or answer context to answer this confidently.",
      userText ? `Question: ${userText}` : "",
      "Use Ask the Community to collect student experience before relying on an answer.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const sourceLines = sources
    .slice(0, 4)
    .map((source) => `[${source.label}: ${source.title}] ${source.snippet}`)
    .join("\n\n");

  return [
    "I found related public CardinalXchange context, but no model provider is configured, so this is an extractive draft.",
    sourceLines,
    "Treat these sources as starting points. Ask the Community if you need current student-specific experience.",
  ].join("\n\n");
}

export function formatSourcesForPrompt(sources: AiChatSource[]): string {
  if (sources.length === 0) {
    return "No public CardinalXchange sources were found before generation.";
  }

  return sources
    .map((source, index) => {
      return [
        `[${index + 1}] ${source.label}: ${source.title}`,
        `URL: ${source.url}`,
        `Snippet: ${source.snippet}`,
      ].join("\n");
    })
    .join("\n\n");
}

