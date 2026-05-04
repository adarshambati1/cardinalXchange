import Link from "next/link";

import type { QuestionDetailDto } from "@/server/http/contracts";

/**
 * Header + body for the question detail page. Title is rendered as the only
 * editorial-leaning surface (serif title-case). Square 1px tag pills below.
 */
export function QuestionDetail({ question }: { question: QuestionDetailDto }) {
  return (
    <article className="border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-6 py-6 sm:px-8">
      <header>
        <h1
          className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--color-ink-900)] sm:text-4xl"
          style={{ borderRadius: "var(--radius-title)" }}
        >
          {question.title}
        </h1>
        <p className="mt-3 text-xs text-[var(--color-ink-500)]">
          asked by{" "}
          <span className="font-medium text-[var(--color-ink-700)]">
            {question.author}
          </span>{" "}
          · {question.askedAt}
        </p>
      </header>

      {question.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <Link
              className="inline-flex items-center border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-2 py-0.5 text-xs font-medium leading-none text-[var(--color-ink-700)] transition-colors duration-150 ease-out hover:border-[var(--color-cardinal-500)] hover:text-[var(--color-cardinal-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
              href={`/questions?tag=${tag.slug}`}
              key={tag.slug}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--color-ink-900)]">
        {question.body}
      </div>
    </article>
  );
}

export default QuestionDetail;
