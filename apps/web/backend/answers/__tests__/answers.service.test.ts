import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@cardinalxchange/db", () => ({
  createAnswerRecord: vi.fn(),
  listAnswerRecords: vi.fn(),
}));

import { createAnswerRecord, listAnswerRecords } from "@cardinalxchange/db";

import { HttpError } from "@/backend/http/http";
import { addAnswer, listAnswers } from "../answers.service";

type Mocked<T> = T & ReturnType<typeof vi.fn>;
const create = createAnswerRecord as unknown as Mocked<
  typeof createAnswerRecord
>;
const list = listAnswerRecords as unknown as Mocked<typeof listAnswerRecords>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addAnswer", () => {
  it("returns an answer DTO on success, echoing the questionId", async () => {
    create.mockResolvedValueOnce({
      id: "a-1",
      questionId: "q-1",
      body: "answer body",
      authorName: "Alice",
      authorMeta: "PhD '27",
      createdAt: new Date("2026-04-01T00:00:00Z"),
      updatedAt: new Date("2026-04-01T00:00:00Z"),
    });

    const dto = await addAnswer("q-1", { body: "answer body" });

    expect(dto).toEqual({
      id: "a-1",
      questionId: "q-1",
      body: "answer body",
      author: "Alice",
      authorMeta: "PhD '27",
      createdAt: "2026-04-01T00:00:00.000Z",
    });
  });

  it("throws HttpError(404, question_not_found) when the question is missing", async () => {
    create.mockResolvedValueOnce(null);

    await expect(addAnswer("missing", { body: "x" })).rejects.toBeInstanceOf(
      HttpError,
    );

    create.mockResolvedValueOnce(null);
    try {
      await addAnswer("missing", { body: "x" });
    } catch (err) {
      const httpError = err as HttpError;
      expect(httpError.status).toBe(404);
      expect(httpError.code).toBe("question_not_found");
    }
  });

  it("falls back to viewer.displayName when authorDisplayName is omitted", async () => {
    create.mockResolvedValueOnce({
      id: "a-2",
      questionId: "q-2",
      body: "x",
      authorName: "Stanford Student",
      authorMeta: "Dev viewer",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await addAnswer("q-2", { body: "x" });

    expect(create.mock.calls[0]?.[1]).toMatchObject({
      authorName: "Stanford Student",
    });
  });

  it("forwards a custom authorDisplayName/authorMeta to the DB call", async () => {
    create.mockResolvedValueOnce({
      id: "a-3",
      questionId: "q-3",
      body: "x",
      authorName: "Custom",
      authorMeta: "Meta",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await addAnswer("q-3", {
      body: "x",
      authorDisplayName: "Custom",
      authorMeta: "Meta",
    });

    expect(create.mock.calls[0]?.[1]).toMatchObject({
      authorName: "Custom",
      authorMeta: "Meta",
    });
  });

  it("normalizes a null authorMeta to an empty string in the DTO", async () => {
    create.mockResolvedValueOnce({
      id: "a-4",
      questionId: "q-4",
      body: "x",
      authorName: "X",
      authorMeta: null,
      createdAt: new Date("2026-04-01T00:00:00Z"),
      updatedAt: new Date("2026-04-01T00:00:00Z"),
    });

    const dto = await addAnswer("q-4", { body: "x" });
    expect(dto.authorMeta).toBe("");
  });
});

describe("listAnswers", () => {
  it("throws HttpError(404, question_not_found) when the question is missing", async () => {
    list.mockResolvedValueOnce(null);

    await expect(listAnswers("missing")).rejects.toBeInstanceOf(HttpError);
  });

  it("maps each row to an AnswerDto", async () => {
    list.mockResolvedValueOnce([
      {
        id: "a-1",
        questionId: "q-1",
        body: "first",
        authorName: "Alice",
        authorMeta: "CS '26",
        createdAt: new Date("2026-04-01T00:00:00Z"),
        updatedAt: new Date("2026-04-01T00:00:00Z"),
      },
      {
        id: "a-2",
        questionId: "q-1",
        body: "second",
        authorName: "Bob",
        authorMeta: null,
        createdAt: new Date("2026-04-02T00:00:00Z"),
        updatedAt: new Date("2026-04-02T00:00:00Z"),
      },
    ]);

    const result = await listAnswers("q-1");

    expect(result.map((a) => a.id)).toEqual(["a-1", "a-2"]);
    expect(result[0]?.author).toBe("Alice");
    expect(result[1]?.authorMeta).toBe("");
  });
});
