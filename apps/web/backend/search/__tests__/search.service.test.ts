import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@cardinalxchange/db", () => ({
  searchQuestionRecords: vi.fn(),
  searchInternalContext: vi.fn(),
}));

import {
  searchInternalContext as dbSearchInternalContext,
  searchQuestionRecords,
} from "@cardinalxchange/db";

import { search, searchInternalContext } from "../search.service";

type Mocked<T> = T & ReturnType<typeof vi.fn>;
const searchRecords = searchQuestionRecords as unknown as Mocked<
  typeof searchQuestionRecords
>;
const internal = dbSearchInternalContext as unknown as Mocked<
  typeof dbSearchInternalContext
>;

function record(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "q-1",
    slug: "slug-1",
    title: "Title",
    body: "Body",
    status: "OPEN" as const,
    authorName: "Asker",
    authorMeta: "",
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("search", () => {
  it("delegates to searchQuestionRecords with the trimmed query and tag filter", async () => {
    searchRecords.mockResolvedValueOnce([]);

    await search("eduroam", { tag: "wifi", limit: 5 });

    expect(searchRecords).toHaveBeenCalledWith({
      query: "eduroam",
      tags: ["wifi"],
      limit: 5,
    });
  });

  it("returns an empty list when no results match", async () => {
    searchRecords.mockResolvedValueOnce([]);

    const result = await search("absentee", {});

    expect(result).toEqual([]);
  });

  it("maps each match to a QuestionSummaryDto", async () => {
    searchRecords.mockResolvedValueOnce([
      record({ id: "q-1", slug: "first", title: "First" }),
      record({ id: "q-2", slug: "second", title: "Second" }),
    ]);

    const result = await search("query", {});

    expect(result.map((row) => row.id)).toEqual(["q-1", "q-2"]);
    expect(result[0]?.title).toBe("First");
  });

  it("forwards an empty tag list when no tag is provided", async () => {
    searchRecords.mockResolvedValueOnce([]);

    await search("hello", {});

    expect(searchRecords).toHaveBeenCalledWith({
      query: "hello",
      tags: [],
      limit: undefined,
    });
  });
});

describe("searchInternalContext", () => {
  it("defaults limit to 6 when omitted", async () => {
    internal.mockResolvedValueOnce([]);

    await searchInternalContext("hello");

    expect(internal).toHaveBeenCalledWith("hello", {
      limit: 6,
      tags: undefined,
    });
  });

  it("respects an explicit limit and tags filter", async () => {
    internal.mockResolvedValueOnce([]);

    await searchInternalContext("query", { limit: 3, tags: ["wifi"] });

    expect(internal).toHaveBeenCalledWith("query", {
      limit: 3,
      tags: ["wifi"],
    });
  });

  it("shapes question rows into AiChatSource DTOs", async () => {
    internal.mockResolvedValueOnce([
      {
        kind: "question",
        refId: "q-1",
        questionId: "q-1",
        title: "Question title",
        snippet: "Question snippet",
        url: "/questions/q-1",
      },
    ]);

    const result = await searchInternalContext("query");

    expect(result).toEqual([
      {
        id: "question:q-1",
        kind: "question",
        label: "Question",
        title: "Question title",
        snippet: "Question snippet",
        questionId: "q-1",
        answerId: undefined,
        url: "/questions/q-1",
      },
    ]);
  });

  it("labels answer rows as 'Answer' and threads through answerId", async () => {
    internal.mockResolvedValueOnce([
      {
        kind: "answer",
        refId: "a-1",
        questionId: "q-1",
        answerId: "a-1",
        title: "Answer on: Question title",
        snippet: "Answer snippet",
        url: "/questions/q-1#a-1",
      },
    ]);

    const [row] = await searchInternalContext("query");

    expect(row?.label).toBe("Answer");
    expect(row?.id).toBe("answer:a-1");
    expect(row?.answerId).toBe("a-1");
  });
});
