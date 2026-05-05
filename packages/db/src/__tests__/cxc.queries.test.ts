import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  prisma: {
    aiChatSession: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
    question: { findMany: vi.fn() },
  },
}));

import { searchInternalContext } from "../cxc.queries";

import { prisma } from "../client";

const questionFindMany = prisma.question.findMany as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  questionFindMany.mockReset();
});

function fakeQuestion(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "q-1",
    slug: "slug-1",
    title: "Question title",
    body: "Question body content.",
    status: "OPEN" as const,
    authorName: "A",
    authorMeta: null,
    searchText: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
    tags: [],
    answers: [],
    _count: { answers: 0 },
    ...overrides,
  };
}

describe("searchInternalContext", () => {
  it("returns at most `limit` rows even when matches yield more", async () => {
    questionFindMany.mockResolvedValueOnce([
      fakeQuestion({ id: "q-1", title: "T1" }),
      fakeQuestion({ id: "q-2", title: "T2" }),
      fakeQuestion({ id: "q-3", title: "T3" }),
    ]);

    const rows = await searchInternalContext("foo", { limit: 2 });
    expect(rows).toHaveLength(2);
  });

  it("emits a question row for each match with kind='question' and built URL", async () => {
    questionFindMany.mockResolvedValueOnce([
      fakeQuestion({
        id: "q-1",
        title: "How to drop CS 109?",
        body: "Body text",
      }),
    ]);

    const [row] = await searchInternalContext("drop");
    expect(row).toMatchObject({
      kind: "question",
      questionId: "q-1",
      title: "How to drop CS 109?",
      url: "/questions/q-1",
      refId: "q-1",
    });
  });

  it("emits answer rows with kind='answer' and an anchor URL", async () => {
    questionFindMany.mockResolvedValueOnce([
      fakeQuestion({
        id: "q-1",
        title: "Q",
        body: "B",
        answers: [
          {
            id: "a-1",
            questionId: "q-1",
            body: "Answer body",
            authorName: "Alice",
            authorMeta: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        _count: { answers: 1 },
      }),
    ]);

    const rows = await searchInternalContext("Q", { limit: 6 });
    const answer = rows.find((row) => row.kind === "answer");
    expect(answer).toBeDefined();
    expect(answer?.url).toBe("/questions/q-1#a-1");
    expect(answer?.title).toBe("Answer on: Q");
    expect(answer?.answerId).toBe("a-1");
  });
});
