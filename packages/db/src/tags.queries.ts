import type { Tag } from "@prisma/client";

import { prisma } from "./client";

export type TagWithCountRecord = Pick<Tag, "slug" | "label"> & {
  questionCount: number;
};

/**
 * List every tag with its associated question count. Ordered by question
 * count descending, then label ascending so popular tags surface first and
 * the rest read alphabetically.
 */
export async function listTagsWithCounts(): Promise<TagWithCountRecord[]> {
  const rows = await prisma.tag.findMany({
    select: {
      slug: true,
      label: true,
      _count: { select: { questions: true } },
    },
  });

  return rows
    .map((row) => ({
      slug: row.slug,
      label: row.label,
      questionCount: row._count.questions,
    }))
    .sort((a, b) => {
      if (a.questionCount !== b.questionCount) {
        return b.questionCount - a.questionCount;
      }
      return a.label.localeCompare(b.label);
    });
}
