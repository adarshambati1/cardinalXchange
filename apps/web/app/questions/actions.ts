"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addAnswer } from "@/server/answers/answers.service";
import { createQuestion } from "@/server/questions/questions.service";

export async function postQuestionAction(formData: FormData) {
  const question = await createQuestion({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    tags: splitTags(String(formData.get("tags") ?? "")),
  });

  revalidatePath("/questions");
  redirect(`/questions/${question.slug}`);
}

export async function postAnswerAction(questionId: string, formData: FormData) {
  await addAnswer(questionId, {
    body: String(formData.get("body") ?? ""),
  });

  revalidatePath("/questions");
  revalidatePath(`/questions/${questionId}`);
  redirect(`/questions/${questionId}`);
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}
