import Link from "next/link";
import { notFound } from "next/navigation";

import { postAnswerAction } from "@/app/questions/actions";
import { HttpError } from "@/server/http/http";
import { getQuestionDetail } from "@/server/questions/questions.service";

type QuestionDetailPageProps = {
  params: Promise<{ questionId: string }>;
};

export default async function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const { questionId } = await params;
  let question;

  try {
    question = await getQuestionDetail(questionId);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <Link
          className="text-cardinal-700 hover:text-cardinal-800 text-sm font-bold"
          href="/questions"
        >
          Back to questions
        </Link>
      </div>

      <article className="border-graphite-200 shadow-graphite-950/[0.03] rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-graphite-950 text-2xl font-black tracking-normal sm:text-3xl">
              {question.title}
            </h1>
            <p className="text-graphite-500 mt-2 text-sm font-semibold">
              Asked by {question.author} {question.askedAt}
            </p>
          </div>
        </div>

        <p className="text-graphite-700 mt-5 text-sm leading-6 whitespace-pre-wrap">
          {question.body}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <Link
              className="border-graphite-200 bg-graphite-50 text-graphite-700 hover:border-cardinal-200 hover:text-cardinal-800 rounded-md border px-2 py-1 text-xs font-semibold transition"
              href={`/questions?tag=${tag.slug}#questions`}
              key={tag.slug}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </article>

      <section className="border-graphite-200 shadow-graphite-950/[0.03] mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-graphite-950 text-xl font-black">
          Answers ({question.answers})
        </h2>
        <div className="divide-graphite-100 mt-4 divide-y">
          {question.answers > 0 ? (
            question.answersList.map((answer) => (
              <article className="py-4 first:pt-0 last:pb-0" key={answer.id}>
                <p className="text-graphite-700 text-sm leading-6 whitespace-pre-wrap">
                  {answer.body}
                </p>
                <p className="text-graphite-500 mt-3 text-xs font-bold">
                  {answer.author} answered {formatDate(answer.createdAt)}
                </p>
              </article>
            ))
          ) : (
            <p className="text-graphite-500 py-4 text-sm font-semibold">
              No answers yet. Add the first answer below.
            </p>
          )}
        </div>
      </section>

      <section className="border-graphite-200 shadow-graphite-950/[0.03] mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-graphite-950 text-xl font-black">Your Answer</h2>
        <form
          action={postAnswerAction.bind(null, question.slug)}
          className="mt-4 space-y-4"
        >
          <label className="block">
            <span className="text-graphite-800 text-sm font-bold">Answer</span>
            <textarea
              className="border-graphite-200 text-graphite-950 placeholder:text-graphite-500 focus:border-cardinal-400 focus:ring-cardinal-100 mt-2 min-h-40 w-full rounded-md border bg-white px-3 py-2 text-sm leading-6 transition outline-none focus:ring-2"
              maxLength={5000}
              name="body"
              required
            />
          </label>
          <button
            className="bg-cardinal-700 shadow-cardinal-950/10 hover:bg-cardinal-800 focus-visible:ring-cardinal-600 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            type="submit"
          >
            Post Answer
          </button>
        </form>
      </section>
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
