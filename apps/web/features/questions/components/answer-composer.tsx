"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition, type FormEvent } from "react";

import type { CreateAnswerInput } from "@/server/http/contracts";

type AnswerComposerProps = {
  questionId: string;
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

/**
 * Posts an answer via `POST /api/questions/[id]/answers` and refreshes the
 * server-rendered list on success. No drafts persisted.
 */
export function AnswerComposer({ questionId }: AnswerComposerProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      const trimmed = body.trim();
      if (!trimmed) {
        setError("Answer body is required.");
        return;
      }

      setSubmitting(true);
      try {
        const payload: CreateAnswerInput = { body: trimmed };
        const response = await fetch(
          `/api/questions/${encodeURIComponent(questionId)}/answers`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const data = (await safeJson(response)) as ApiErrorBody | null;
          setError(
            data?.error?.message ??
              "Could not post that answer. Try again in a moment.",
          );
          return;
        }

        setBody("");
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setError("Network error — could not reach the server.");
      } finally {
        setSubmitting(false);
      }
    },
    [body, questionId, router],
  );

  return (
    <section
      aria-labelledby="answer-composer-heading"
      className="border border-[var(--color-border-default)] bg-[var(--color-surface-base)]"
    >
      <header className="border-b border-[var(--color-border-default)] px-6 py-4 sm:px-8">
        <h2
          className="text-base font-semibold text-[var(--color-ink-900)]"
          id="answer-composer-heading"
        >
          Your Answer
        </h2>
      </header>

      <form className="px-6 py-5 sm:px-8" onSubmit={onSubmit} noValidate>
        <label
          className="block text-sm font-medium text-[var(--color-ink-900)]"
          htmlFor="answer-body"
        >
          Answer
        </label>
        <textarea
          aria-describedby={error ? "answer-error" : undefined}
          aria-invalid={error ? "true" : undefined}
          className="mt-2 block min-h-32 w-full border border-[var(--color-border-default)] bg-[var(--color-surface-base)] px-3 py-2 text-sm leading-relaxed text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-300)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-border-focus)]"
          disabled={submitting}
          id="answer-body"
          maxLength={5000}
          name="body"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share concrete steps, links, or experience that helps."
          required
          value={body}
        />
        {error ? (
          <p
            className="mt-2 text-sm font-medium text-[var(--color-state-danger)]"
            id="answer-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex h-10 items-center justify-center border border-transparent bg-[var(--color-cardinal-500)] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[var(--color-cardinal-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Posting…" : "Post Answer"}
          </button>
        </div>
      </form>
    </section>
  );
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default AnswerComposer;
