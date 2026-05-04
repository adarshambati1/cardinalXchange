import type {
  CreateAnswerInput,
  CreateQuestionInput,
} from "@/server/http/contracts";
import { optionalText, requireText, stringList } from "@/server/http/http";

export function parseCreateQuestionInput(
  payload: Record<string, unknown>,
): CreateQuestionInput {
  return {
    title: requireText(payload, "title", 180),
    body: requireText(payload, "body", 5000),
    tags: stringList(payload, "tags"),
    authorDisplayName: optionalText(payload, "authorDisplayName", 80),
    authorMeta: optionalText(payload, "authorMeta", 80),
  };
}

export function parseCreateAnswerInput(payload: Record<string, unknown>): CreateAnswerInput {
  return {
    body: requireText(payload, "body", 5000),
    authorDisplayName: optionalText(payload, "authorDisplayName", 80),
    authorMeta: optionalText(payload, "authorMeta", 80),
  };
}
