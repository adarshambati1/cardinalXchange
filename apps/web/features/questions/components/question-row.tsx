import Link from "next/link";

import type { QuestionSummaryDto } from "@/server/http/contracts";

export function QuestionRow({ question }: { question: QuestionSummaryDto }) {
  const answerCount = question.answers;

  return (
    <article
      className="border-graphite-100 hover:bg-graphite-50 border-b px-4 py-4 transition last:border-b-0 sm:px-5"
      id={question.id}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-graphite-950 min-w-0 text-[15px] leading-snug font-black sm:text-base">
            <Link
              className="hover:text-cardinal-800 focus-visible:ring-cardinal-600 rounded-sm transition outline-none focus-visible:ring-2"
              href={`/questions/${question.slug}`}
            >
              {question.title}
            </Link>
          </h2>
        </div>
        <p className="text-graphite-600 mt-1 line-clamp-2 text-sm leading-5">
          {question.excerpt}
        </p>
        <div className="text-graphite-500 mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {question.tags.map((tag) => (
              <Link
                className="border-graphite-200 bg-graphite-50 text-graphite-700 hover:border-cardinal-200 hover:text-cardinal-800 rounded-md border px-2 py-1 text-xs font-semibold transition"
                href={`/questions?tag=${tag.slug}#questions`}
                key={`${question.id}-${tag.slug}`}
              >
                {tag.label}
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span>{answerCount === 1 ? "1 answer" : `${answerCount} answers`}</span>
            {answerCount === 0 ? <span>unanswered</span> : null}
            <span>
              <span className="text-graphite-800">{question.author}</span> asked{" "}
              {question.askedAt}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
