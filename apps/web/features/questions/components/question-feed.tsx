import Link from "next/link";

import { QuestionRow } from "@/features/questions/components/question-row";
import type { QuestionRowDto } from "@/server/http/contracts";

/**
 * List container for the questions feed. Composes `QuestionRow` items with a
 * 1px ink-100 divider between rows. Empty state matches the brief verbatim.
 */
export function QuestionFeed({ questions }: { questions: QuestionRowDto[] }) {
  if (questions.length === 0) {
    return <QuestionFeedEmptyState />;
  }

  return (
    <section
      aria-labelledby="questions-feed-heading"
      className="border border-[var(--color-border-default)] bg-[var(--color-surface-base)]"
    >
      <h2 className="sr-only" id="questions-feed-heading">
        Questions
      </h2>
      <ul className="divide-y divide-[var(--color-ink-100)]">
        {questions.map((question) => (
          <li key={question.id}>
            <QuestionRow question={question} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuestionFeedEmptyState() {
  return (
    <section className="border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-6 py-12 text-center">
      <p className="text-base font-medium text-[var(--color-ink-900)]">
        No questions yet. Be the first — Ask a Question.
      </p>
      <p className="mt-2 text-sm text-[var(--color-ink-500)]">
        Post a focused question with enough context for a classmate to answer.
      </p>
      <Link
        className="mt-6 inline-flex h-10 items-center justify-center border border-transparent bg-[var(--color-cardinal-500)] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[var(--color-cardinal-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
        href="/ask"
      >
        Ask a Question
      </Link>
    </section>
  );
}

export default QuestionFeed;
