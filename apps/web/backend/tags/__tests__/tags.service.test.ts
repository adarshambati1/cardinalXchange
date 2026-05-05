import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@cardinalxchange/db", () => ({
  listTagsWithCounts: vi.fn(),
}));

import { listTagsWithCounts } from "@cardinalxchange/db";

import { listTagsForIndex } from "../tags.service";

type Mocked<T> = T & ReturnType<typeof vi.fn>;
const list = listTagsWithCounts as unknown as Mocked<typeof listTagsWithCounts>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listTagsForIndex", () => {
  it("returns an empty array when the DB has no tags", async () => {
    list.mockResolvedValueOnce([]);

    const result = await listTagsForIndex();

    expect(result).toEqual([]);
  });

  it("maps DB rows to TagListItemDto preserving slug/label/count", async () => {
    list.mockResolvedValueOnce([
      { slug: "algorithms", label: "Algorithms", questionCount: 5 },
      { slug: "hci", label: "HCI", questionCount: 3 },
      { slug: "stats", label: "Stats", questionCount: 0 },
    ]);

    const result = await listTagsForIndex();

    expect(result).toEqual([
      { slug: "algorithms", label: "Algorithms", questionCount: 5 },
      { slug: "hci", label: "HCI", questionCount: 3 },
      { slug: "stats", label: "Stats", questionCount: 0 },
    ]);
  });

  it("preserves the DB ordering — service does not re-sort", async () => {
    list.mockResolvedValueOnce([
      { slug: "z-tag", label: "Z", questionCount: 10 },
      { slug: "a-tag", label: "A", questionCount: 1 },
    ]);

    const result = await listTagsForIndex();

    expect(result.map((row) => row.slug)).toEqual(["z-tag", "a-tag"]);
  });
});
