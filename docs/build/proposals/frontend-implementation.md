# Frontend Implementation — Build 1, Wave 3

Author: Frontend Agent.
Inputs: `docs/build/03-frontend.md`, `docs/build/proposals/backend-implementation.md`, `docs/build/proposals/design-implementation.md`, `docs/build/proposals/structure-implementation.md`, `docs/build/01-organization.md`, `docs/build/04-design.md`, `CLAUDE.md`, plus the canonical visual spec at `~/.codex/generated_images/.../ig_05b26d49…ce.png`.

This wave wires the four product panels — `/questions`, `/ask`, `/questions/[id]`, `/cxc-ai` — onto the tokens and primitives shipped by the Design Agent and the DTOs/routes shipped by the Backend Agent. The legacy server-action form glue (`apps/web/app/questions/actions.ts`) was deleted in favor of fetch + `router.refresh()`. CXC AI was split out of the Wave-1 monolith into per-component files plus a shared `useChat` wrapper.

## Files created

| Path | Purpose |
|---|---|
| `apps/web/data/topics.data.ts` | Static topic data: 4 canonical rail entries (`CXC AI`, `Questions`, `Topics`, `Trending`) + 8-item generic tag list (academic life, advising, housing, dining, research, internships, financial aid, campus life). No course names. |
| `apps/web/features/shell/components/page-shell.tsx` | Composes the cardinal-red top bar + 4-item left rail + `<main>` slot. Mounted from `app/layout.tsx`. |
| `apps/web/features/questions/components/question-detail.tsx` | Header (serif title, meta, square tag pills) + body for the question detail page. |
| `apps/web/features/questions/components/answer-list.tsx` | Renders all answers in `createdAt asc`. 1px ink-100 dividers between items. Empty state: `No answers yet. Add the first one below.` |
| `apps/web/features/questions/components/answer-composer.tsx` | Client component. POSTs to `/api/questions/[id]/answers` and calls `router.refresh()` on 201. |
| `apps/web/features/ask/components/ask-form.tsx` | Client form: Title, Body, Tags (chip input — comma/Enter to commit). POSTs to `/api/questions`, redirects to `/questions/[slug]` on success. Hydrates `?draft=…` from CXC AI hand-offs. |
| `apps/web/features/cxc-ai/components/source-pill.tsx` | Square 1px-bordered label rendered before assistant text. Opens `Q`/`A` sources at `/questions/[id]` in a new tab; web sources open the URL. |
| `apps/web/features/cxc-ai/components/message-list.tsx` | Renders the thread, source pills, and `Ask the Community` draft cards (with `Use this draft` → `/ask?draft=…`, no DB write). |
| `apps/web/features/cxc-ai/components/message-composer.tsx` | Square textarea + Send. Enter to send; Shift+Enter for newline. Stop button while streaming. |
| `apps/web/features/cxc-ai/hooks/use-cxc-chat.ts` | Wraps `useChat` from `@ai-sdk/react` with the `/api/cxc-ai` transport and posts the finished assistant turn back to `/api/cxc-ai/chats/[chatId]/messages` for persistence. |
| `apps/web/app/questions/loading.tsx` | Square skeleton matching the row geometry. |
| `apps/web/app/questions/error.tsx` | Cardinal-red bordered error card with Retry. |
| `apps/web/app/questions/[questionId]/loading.tsx` | Detail-page skeleton (square placeholders). |
| `apps/web/app/questions/[questionId]/error.tsx` | Error card with Retry + Back to questions. |
| `apps/web/app/ask/loading.tsx` | Form skeleton. |
| `apps/web/app/ask/error.tsx` | Error card. |
| `apps/web/app/cxc-ai/loading.tsx` | Chat skeleton. |
| `apps/web/app/cxc-ai/error.tsx` | Error card. |

## Files migrated (legacy palette → tokens)

Every `bg-paper`, `text-graphite-*`, `bg-cardinal-700/800/900/950`, `border-graphite-*`, `bg-emerald-*`, and `bg-gold-*` class was replaced with the shipped tokens (`bg-[var(--color-cardinal-500)]`, `text-[var(--color-ink-*)]`, `border-[var(--color-border-*)]`, etc.). Square corners are the global default; no `rounded-*` survives in the migrated files.

| Path | Notes |
|---|---|
| `apps/web/app/layout.tsx` | Now mounts `PageShell` from `@/features/shell`. The dead `<div className="bg-paper text-graphite-950 min-h-screen">` wrapper is gone — `globals.css` already paints `body`. |
| `apps/web/app/questions/page.tsx` | Server component. Reads `?tag` / `?sort` / `?query` from `searchParams`, calls `listQuestionsForFeed({ tag, sort })`, applies the `query` filter client-side over the returned set. Adds Newest/Active/Unanswered sort tabs that link to `?sort=…`. |
| `apps/web/app/questions/[questionId]/page.tsx` | Composes `QuestionDetail` + `AnswerList` + `AnswerComposer`. No more inline server-action form. |
| `apps/web/app/ask/page.tsx` | Server component that decodes `?draft=…` and passes it to `<AskForm initialDraft={...} />`. |
| `apps/web/app/cxc-ai/page.tsx` | Mints a session via `createAiChatSession()` and mounts `<ChatShell isNewChat />`. URL replaces to `/cxc-ai/[chatId]` once the first user message is sent (no server redirect). |
| `apps/web/app/cxc-ai/[chatId]/page.tsx` | Loads the snapshot via `getAiChatSnapshot` and mounts `<ChatShell />`. |
| `apps/web/features/shell/components/top-command-bar.tsx` | Cardinal-red bg, white wordmark, full-width search input (controlled, posts to `/questions?query=…`), `Ask Question` CTA. `useSearchParams` is wrapped in a Suspense boundary to satisfy Next 16's static-prerender bailout. |
| `apps/web/features/shell/components/topic-rail.tsx` | Reads from `@/data/topics.data`. Active item gets a 3px cardinal-red left bar + bold label. Square hit targets, no rounded pills. |
| `apps/web/features/questions/components/question-feed.tsx` | List container + brief-aligned empty state (`No questions yet. Be the first — Ask a Question.` + square `Ask a Question` button). |
| `apps/web/features/questions/components/question-row.tsx` | Title link, 1–2 line snippet, square 1px tag pills, meta line `asked by … · N answers · time`. |
| `apps/web/features/cxc-ai/components/chat-shell.tsx` | Slimmed to composition only — pulls `MessageList`, `MessageComposer`, and `useCxcChat`. |

Path alias for `@/data/*` was added to `apps/web/tsconfig.json`.

## Files deleted

- `apps/web/app/questions/actions.ts` — legacy `postQuestionAction` / `postAnswerAction` server actions. Both writes now go through `fetch('/api/questions', …)` / `fetch('/api/questions/[id]/answers', …)`. Verified no remaining callers via `grep -r "questions/actions"`.

## Routes implemented

| Route | Mode | Composes |
|---|---|---|
| `/questions` | Server component | `QuestionFeed` (which renders `QuestionRow` rows or the empty state) + sort tabs |
| `/questions/[questionId]` | Server component | `QuestionDetail` + `AnswerList` + `AnswerComposer` (client island) |
| `/ask` | Server component (decodes `?draft=`) + `AskForm` client island | `AskForm` |
| `/cxc-ai` | Server component (mints session id) | `ChatShell` (with `isNewChat`) |
| `/cxc-ai/[chatId]` | Server component (loads snapshot) | `ChatShell` |
| `/questions/ask` | Existing redirect stub | `redirect("/ask")` (kept for legacy bookmarks) |

`PageShell` (top bar + left rail + `<main>`) wraps every route through `app/layout.tsx`.

## Empty states (verbatim per brief)

| Route | String |
|---|---|
| `/questions` | `No questions yet. Be the first — Ask a Question.` (with a square `Ask a Question` button under the message) |
| `/questions/[id]` answers section | `No answers yet. Add the first one below.` |
| `/cxc-ai` | `Ask anything about Stanford.` headline + `CXC AI cites public Q&A when it can.` body |

The DB on this dev box currently has demo questions in it (the brief assumed empty), so the questions feed renders rows; the empty state is reachable any time the feed returns `[]` (e.g., a tag filter with no matches, or a fresh DB).

## Visual QA

Screenshots at 1440×900, captured via the gstack `/browse` skill against `http://localhost:3000`:

| Path | Saved to | Result |
|---|---|---|
| `/questions` | `/tmp/cxc-frontend-questions.png` | Cardinal-red top bar, white search field, `Ask Question` CTA, 4-item left rail with `Questions` active (cardinal-red left bar + bold), serif `Questions` headline, square Newest/Active/Unanswered tabs (Newest active = filled cardinal red), 1px-bordered feed list with square tag pills. |
| `/ask` | `/tmp/cxc-frontend-ask.png` | Same shell, `Back to questions` link, serif `Ask a Question` title, square Title/Body inputs and Tag chip input, `Post Question` cardinal-red square button. |
| `/cxc-ai` | `/tmp/cxc-frontend-cxc-ai.png` | Same shell, `CXC AI` active in left rail, serif title, sunken-surface conversation panel with the empty-state copy centered, square message composer with disabled `Send` until text is typed, square `New chat` button. |
| `/questions/[id]` | `/tmp/cxc-frontend-question-detail.png` | Serif question title, square 1px tag pills, separate sectioned answers card (empty-state shows the brief copy), separate `Your Answer` composer card with square `Post Answer` button. |

**Confirmed**: square corners visible everywhere; cardinal red is the only chromatic accent; no rounded cards; no drop shadows on body cards; serif/sans/mono fonts loading from `next/font` via the `--font-*` CSS variables (visible in the headline serif treatment vs. the sans body copy).

No visual regressions found in this pass.

## Open questions for next iteration

1. **Search results page.** The top-bar search currently posts to `/questions?query=…` and the questions page filters in-memory. The Backend Agent shipped `GET /api/search` but no dedicated `/search` route yet; once that lands the top bar can route there instead.
2. **Topic rail `Topics` / `Trending` destinations.** They link to `/questions#topics` and `/questions?sort=active` respectively. Real surfaces (a topic browser, a trending leaderboard) are deferred until the brief lists them.
3. **`<aside>` tag/meta rail from the previous `/questions` page is gone.** The image's questions panel is a single-column list; the old tag-cloud sidebar would have been an extra rail on top of the new left rail. If product wants tag counts back, they should live as a sub-panel below the sort tabs, not as a second sidebar.
4. **`useCxcChat` doesn't surface every UIMessage variant.** Only `text`, `source-*`, and the `ask_community_draft` tool output are rendered today. New tool variants will fall through to nothing — fine for now, but worth a `MessagePart` switch the next time the agent grows tools.
5. **`/cxc-ai` mints a session row at page-load.** This means an idle visit to `/cxc-ai` produces an empty `AiChatSession`. The brief allowed that path (the route handler also handles ensure-on-send). If empty sessions accumulate, a TTL prune would be the cleanup, not a frontend change.

## Verification

| Command | Status |
|---|---|
| `pnpm typecheck` | exit 0 — all four workspaces pass. |
| `pnpm lint` | exit 0 — all four workspaces pass with `--max-warnings=0`. |
| `pnpm build` | exit 0 — Next 16 (Turbopack) compiles all 14 routes. The first build attempt failed with a `useSearchParams() should be wrapped in a suspense boundary` error from the top-bar search input on `/_not-found`; resolved by wrapping the search field in a `<Suspense>` inside `top-command-bar.tsx`. |
| Visual QA | All four panels render against the live dev server at `http://localhost:3000`. Screenshots at `/tmp/cxc-frontend-{questions,ask,cxc-ai,question-detail}.png`. |
