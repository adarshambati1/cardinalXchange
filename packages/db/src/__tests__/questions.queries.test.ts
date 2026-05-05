import { describe, expect, it } from "vitest";

import { normalizeTagLabels, slugify } from "../questions.queries";

describe("slugify", () => {
  it("lowercases and hyphenates a simple title", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses runs of non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("CS 109 ---  Probability!!!")).toBe("cs-109-probability");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("   --machine learning--   ")).toBe("machine-learning");
  });

  it("returns an empty string when there is nothing slug-worthy", () => {
    expect(slugify("")).toBe("");
    expect(slugify("###")).toBe("");
  });

  it("strips characters outside the ASCII alphanumeric set, including unicode", () => {
    // The current slugify only preserves [a-z0-9]; unicode is dropped, not transliterated.
    expect(slugify("Café Latté")).toBe("caf-latt");
  });

  it("caps slug length at 72 characters", () => {
    const long = "a".repeat(200);
    const result = slugify(long);
    expect(result.length).toBe(72);
    expect(result).toBe("a".repeat(72));
  });
});

describe("normalizeTagLabels", () => {
  it("trims whitespace and computes slugs", () => {
    expect(normalizeTagLabels(["  Algorithms  ", "Data Structures"])).toEqual([
      { label: "Algorithms", slug: "algorithms" },
      { label: "Data Structures", slug: "data-structures" },
    ]);
  });

  it("dedupes by slug, keeping the first occurrence's label", () => {
    expect(normalizeTagLabels(["Machine Learning", "machine-learning", "ML"])).toEqual([
      { label: "Machine Learning", slug: "machine-learning" },
      { label: "ML", slug: "ml" },
    ]);
  });

  it("drops empty and whitespace-only entries", () => {
    expect(normalizeTagLabels(["", "   ", "Stats"])).toEqual([
      { label: "Stats", slug: "stats" },
    ]);
  });

  it("drops entries whose slug ends up empty", () => {
    // "###" trims non-empty but slugifies to ""
    expect(normalizeTagLabels(["###", "Linear Algebra"])).toEqual([
      { label: "Linear Algebra", slug: "linear-algebra" },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(normalizeTagLabels([])).toEqual([]);
  });
});
