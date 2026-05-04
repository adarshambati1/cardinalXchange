import Link from "next/link";
import { Surface } from "@cardinalxchange/ui";

import { QuestionRow } from "@/features/questions/components/question-row";
import type { QuestionSummaryDto } from "@/server/http/contracts";

export function QuestionFeed({
  activeFilter,
  questions,
}: {
  activeFilter?: string;
  questions: QuestionSummaryDto[];
}) {
  return (
    <section
      aria-labelledby="questions-heading"
      className="space-y-4"
      id="questions"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-graphite-950 text-xl font-black tracking-normal sm:text-2xl"
            id="questions-heading"
          >
            Questions
          </h1>
          <p className="text-graphite-600 mt-1 text-sm font-medium">
            Reusable answers from the CardinalXchange community.
          </p>
        </div>
        <Link
          className="bg-cardinal-700 shadow-cardinal-950/10 hover:bg-cardinal-800 focus-visible:ring-cardinal-600 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/ask"
        >
          Ask Question
        </Link>
      </div>

      <div
        aria-label="Question sort"
        className="border-graphite-200 flex gap-1 overflow-x-auto rounded-md border bg-white p-1"
        role="tablist"
      >
        <Link
          aria-selected={!activeFilter}
          className={`focus-visible:ring-cardinal-600 h-9 shrink-0 rounded-md px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:outline-none ${
            !activeFilter
              ? "bg-cardinal-700 text-white shadow-sm"
              : "text-graphite-600 hover:bg-graphite-100 hover:text-graphite-950"
          }`}
          href="/questions"
          role="tab"
        >
          Newest
        </Link>
        <Link
          aria-selected={activeFilter === "unanswered"}
          className={`focus-visible:ring-cardinal-600 h-9 shrink-0 rounded-md px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:outline-none ${
            activeFilter === "unanswered"
              ? "bg-cardinal-700 text-white shadow-sm"
              : "text-graphite-600 hover:bg-graphite-100 hover:text-graphite-950"
          }`}
          href="/questions?filter=unanswered"
          id="unanswered"
          role="tab"
        >
          Unanswered
        </Link>
      </div>

      <Surface className="overflow-hidden">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))
        ) : (
          <div className="text-graphite-500 px-5 py-10 text-sm font-semibold">
            No questions match this filter.
          </div>
        )}
      </Surface>
    </section>
  );
}
