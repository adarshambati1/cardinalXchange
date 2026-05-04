import Link from "next/link";

import { postQuestionAction } from "@/app/questions/actions";

export default function AskQuestionPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <Link
          className="text-cardinal-700 hover:text-cardinal-800 text-sm font-bold"
          href="/questions"
        >
          Back to questions
        </Link>
        <h1 className="text-graphite-950 mt-3 text-2xl font-black tracking-normal sm:text-3xl">
          Ask a Question
        </h1>
        <p className="text-graphite-600 mt-2 text-sm leading-6">
          Write a focused question with enough context for another student to
          answer.
        </p>
      </div>

      <form
        action={postQuestionAction}
        className="border-graphite-200 shadow-graphite-950/[0.03] space-y-5 rounded-lg border bg-white p-5 shadow-sm"
      >
        <label className="block">
          <span className="text-graphite-800 text-sm font-bold">Title</span>
          <input
            className="border-graphite-200 text-graphite-950 placeholder:text-graphite-500 focus:border-cardinal-400 focus:ring-cardinal-100 mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm transition outline-none focus:ring-2"
            maxLength={180}
            name="title"
            placeholder="What is your question?"
            required
          />
        </label>

        <label className="block">
          <span className="text-graphite-800 text-sm font-bold">Details</span>
          <textarea
            className="border-graphite-200 text-graphite-950 placeholder:text-graphite-500 focus:border-cardinal-400 focus:ring-cardinal-100 mt-2 min-h-48 w-full rounded-md border bg-white px-3 py-2 text-sm leading-6 transition outline-none focus:ring-2"
            maxLength={5000}
            name="body"
            placeholder="Include what you have tried, what would make an answer useful, and any relevant constraints."
            required
          />
        </label>

        <label className="block">
          <span className="text-graphite-800 text-sm font-bold">Tags</span>
          <input
            className="border-graphite-200 text-graphite-950 placeholder:text-graphite-500 focus:border-cardinal-400 focus:ring-cardinal-100 mt-2 h-11 w-full rounded-md border bg-white px-3 text-sm transition outline-none focus:ring-2"
            name="tags"
            placeholder="research, housing, internships"
          />
        </label>

        <div className="border-graphite-100 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-graphite-500 text-xs font-semibold">
            Posting sends this question to the public Q&A list.
          </p>
          <button
            className="bg-cardinal-700 shadow-cardinal-950/10 hover:bg-cardinal-800 focus-visible:ring-cardinal-600 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            type="submit"
          >
            Post Question
          </button>
        </div>
      </form>
    </main>
  );
}
