import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  prisma: {
    tag: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../client";
import { listTagsWithCounts } from "../tags.queries";

const findMany = prisma.tag.findMany as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  findMany.mockReset();
});

describe("listTagsWithCounts", () => {
  it("returns an empty array when there are no tags", async () => {
    findMany.mockResolvedValueOnce([]);
    const result = await listTagsWithCounts();
    expect(result).toEqual([]);
  });

  it("orders by question count desc, then label asc as tiebreaker", async () => {
    findMany.mockResolvedValueOnce([
      { slug: "z", label: "Z", _count: { questions: 1 } },
      { slug: "a", label: "A", _count: { questions: 5 } },
      { slug: "b", label: "B", _count: { questions: 5 } },
      { slug: "c", label: "C", _count: { questions: 1 } },
    ]);

    const result = await listTagsWithCounts();

    expect(result.map((row) => row.slug)).toEqual(["a", "b", "c", "z"]);
    expect(result.map((row) => row.questionCount)).toEqual([5, 5, 1, 1]);
  });

  it("flattens the _count.questions into questionCount", async () => {
    findMany.mockResolvedValueOnce([
      { slug: "wifi", label: "Wi-Fi", _count: { questions: 3 } },
    ]);

    const [row] = await listTagsWithCounts();
    expect(row).toEqual({ slug: "wifi", label: "Wi-Fi", questionCount: 3 });
  });
});
