import Link from "next/link";

import { QuestionFeed } from "@/features/questions/components/question-feed";
import type {
  QuestionSummaryDto,
  QuestionTagDto,
} from "@/server/http/contracts";
import { listQuestions } from "@/server/questions/questions.service";

type QuestionsPageProps = {
  searchParams: Promise<{
    filter?: string;
    tag?: string;
  }>;
};

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const { filter, tag } = await searchParams;
  const questions = await listQuestions();
  const visibleQuestions = questions.filter((question) => {
    if (filter === "unanswered" && question.answers > 0) {
      return false;
    }

    if (tag && !question.tags.some((questionTag) => questionTag.slug === tag)) {
      return false;
    }

    return true;
  });
  const tags = getTagCounts(questions);
  const unansweredCount = questions.filter((question) => question.answers === 0).length;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-6">
        <section className="border-graphite-200 shadow-graphite-950/[0.03] rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-cardinal-700 text-sm font-bold">
                CardinalXchange
              </p>
              <h1 className="text-graphite-950 mt-2 text-2xl font-black tracking-normal sm:text-3xl">
                Stanford Q&A
              </h1>
              <p className="text-graphite-600 mt-2 max-w-2xl text-sm leading-6">
                Ask focused questions, add tags, and help classmates find
                answers that stay useful after the thread moves on.
              </p>
            </div>
            <Link
              className="bg-cardinal-700 shadow-cardinal-950/10 hover:bg-cardinal-800 focus-visible:ring-cardinal-600 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              href="/ask"
            >
              Ask Question
            </Link>
          </div>
        </section>

        <QuestionFeed activeFilter={filter} questions={visibleQuestions} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <section
          className="border-graphite-200 shadow-graphite-950/[0.03] rounded-lg border bg-white p-4 shadow-sm"
          id="tags"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-graphite-950 text-base font-black">Tags</h2>
            <Link
              className="text-cardinal-700 hover:text-cardinal-800 text-xs font-bold"
              href="/questions"
            >
              Clear
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tagItem) => (
              <Link
                className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
                  tag === tagItem.slug
                    ? "border-cardinal-200 bg-cardinal-50 text-cardinal-800"
                    : "border-graphite-200 bg-graphite-50 text-graphite-700 hover:border-cardinal-200 hover:text-cardinal-800"
                }`}
                href={`/questions?tag=${tagItem.slug}#questions`}
                key={tagItem.slug}
              >
                {tagItem.label} ({tagItem.count})
              </Link>
            ))}
          </div>
        </section>

        <section className="border-graphite-200 shadow-graphite-950/[0.03] rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-graphite-950 text-base font-black">Unanswered</h2>
          <p className="text-graphite-600 mt-2 text-sm leading-6">
            {unansweredCount} questions need a first answer.
          </p>
          <Link
            className="border-graphite-200 text-graphite-900 hover:border-graphite-300 hover:bg-graphite-50 focus-visible:ring-cardinal-600 mt-3 inline-flex h-9 items-center justify-center rounded-md border bg-white px-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/questions?filter=unanswered#questions"
          >
            View unanswered
          </Link>
        </section>
      </aside>
    </main>
  );
}

function getTagCounts(questions: QuestionSummaryDto[]) {
  const tags = new Map<string, QuestionTagDto & { count: number }>();

  questions.forEach((question) => {
    question.tags.forEach((tag) => {
      const current = tags.get(tag.slug);
      tags.set(tag.slug, {
        ...tag,
        count: current ? current.count + 1 : 1,
      });
    });
  });

  return Array.from(tags.values()).sort((first, second) =>
    first.label.localeCompare(second.label),
  );
}
