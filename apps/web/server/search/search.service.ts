import { searchQuestionRecords } from "@cardinalxchange/db";

import type { QuestionDetailDto } from "@/server/http/contracts";
import { toDetailDto } from "@/server/questions/questions.service";

export async function searchInternalContext(
  query: string,
  tags: string[] = [],
): Promise<QuestionDetailDto[]> {
  const questions = await searchQuestionRecords(query, tags);
  return questions.map(toDetailDto);
}
