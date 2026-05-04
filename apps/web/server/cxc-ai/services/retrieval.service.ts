import type { AiChatSource } from "@/server/http/contracts";

type RetrievePublicSourcesArgs = {
  query: string;
  tags?: string[];
  limit?: number;
};

export async function retrievePublicQuestionAnswerSources({
  query,
  tags = [],
  limit = 6,
}: RetrievePublicSourcesArgs): Promise<AiChatSource[]> {
  const sources = await searchQuestionContext(query, tags);
  const queryTerms = tokenize(query);

  return sources
    .map((source) => ({
      source,
      score: scoreSource(source, queryTerms),
    }))
    .sort((first, second) => second.score - first.score)
    .map(({ source }) => source)
    .slice(0, limit);
}

async function searchQuestionContext(
  query: string,
  tags: string[],
): Promise<AiChatSource[]> {
  try {
    const search = await import("@/server/search/search.service");
    const results = await search.searchInternalContext(query, tags);
    return results.flatMap((question) => {
      const questionSource: AiChatSource = {
        id: `question:${question.id}`,
        kind: "question",
        label: "Question",
        title: question.title,
        snippet: question.body,
        questionId: question.id,
        url: `/questions/${question.id}`,
      };
      const answerSources = question.answersList.map(
        (answer): AiChatSource => ({
          id: `answer:${answer.id}`,
          kind: "answer",
          label: "Answer",
          title: `Answer on: ${question.title}`,
          snippet: answer.body,
          questionId: question.id,
          answerId: answer.id,
          url: `/questions/${question.id}#${answer.id}`,
        }),
      );

      return [questionSource, ...answerSources];
    });
  } catch {
    return [];
  }
}

function scoreSource(source: AiChatSource, queryTerms: string[]): number {
  const haystack = `${source.title} ${source.snippet}`.toLowerCase();
  const termScore = queryTerms.reduce(
    (score, term) => score + (haystack.includes(term) ? 1 : 0),
    0,
  );
  const kindScore = source.kind === "answer" ? 0.25 : 0;
  return termScore + kindScore;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length > 2)
    .slice(0, 12);
}
