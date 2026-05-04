import { Prisma } from "@prisma/client";

import { prisma } from "./client";
import { questionInclude, type QuestionRecord } from "./types";

export async function listQuestionRecords(): Promise<QuestionRecord[]> {
  return prisma.question.findMany({
    include: questionInclude,
    orderBy: {
      lastActivityAt: "desc",
    },
  });
}

export async function getQuestionRecord(
  questionIdOrSlug: string,
): Promise<QuestionRecord | null> {
  return prisma.question.findFirst({
    where: questionIdentityWhere(questionIdOrSlug),
    include: questionInclude,
  });
}

export async function searchQuestionRecords(
  query: string,
  tags: string[] = [],
): Promise<QuestionRecord[]> {
  const trimmedQuery = query.trim();
  const tagSlugs = normalizeTagLabels(tags).map((tag) => tag.slug);
  const filters: Prisma.QuestionWhereInput[] = [];

  if (trimmedQuery.length > 0) {
    filters.push({
      OR: [
        { title: { contains: trimmedQuery, mode: "insensitive" } },
        { body: { contains: trimmedQuery, mode: "insensitive" } },
        { searchText: { contains: trimmedQuery, mode: "insensitive" } },
        {
          answers: {
            some: {
              body: { contains: trimmedQuery, mode: "insensitive" },
            },
          },
        },
        {
          tags: {
            some: {
              tag: {
                label: { contains: trimmedQuery, mode: "insensitive" },
              },
            },
          },
        },
      ],
    });
  }

  if (tagSlugs.length > 0) {
    filters.push({
      tags: {
        some: {
          tag: {
            slug: {
              in: tagSlugs,
            },
          },
        },
      },
    });
  }

  return prisma.question.findMany({
    where: filters.length > 0 ? { AND: filters } : undefined,
    include: questionInclude,
    orderBy: {
      lastActivityAt: "desc",
    },
    take: 5,
  });
}

export function questionIdentityWhere(
  questionIdOrSlug: string,
): Prisma.QuestionWhereInput {
  return {
    OR: [{ id: questionIdOrSlug }, { slug: questionIdOrSlug }],
  };
}

export function normalizeTagLabels(labels: string[]) {
  const seen = new Set<string>();

  return labels
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      slug: slugify(label),
    }))
    .filter((tag) => {
      if (!tag.slug || seen.has(tag.slug)) {
        return false;
      }
      seen.add(tag.slug);
      return true;
    });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}
