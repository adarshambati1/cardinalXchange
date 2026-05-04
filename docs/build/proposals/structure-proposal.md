# Structure Proposal — Build 1

Author: Structure Proposer agent
Spec: `docs/build/01-organization.md`
Visual source of truth: the four-panel image referenced in `docs/build/README.md`.

This proposal targets the empty-DB MVP described in `CLAUDE.md` and `docs/architecture.md`: question feed, ask form, question detail (with multiple stacked answers per the documented build deviation), and full-page CXC AI chat. No auth, no courses, no votes, no seeded data, `packages/ui` stays client-safe.

## 1. Target Tree

```
apps/web/
  app/                                  # App Router. Routes only — thin glue to features + server.
    layout.tsx
    page.tsx                            # redirect → /questions
    globals.css
    fonts.ts                            # next/font definitions consumed by layout (per 04-design)
    loading.tsx                         # root suspense fallback
    error.tsx                           # root error boundary
    not-found.tsx
    questions/
      page.tsx                          # panel 1 — feed
      loading.tsx
      error.tsx
      [questionId]/
        page.tsx                        # panel 3 — detail + multiple answers
        loading.tsx
        error.tsx
      actions.ts                        # "use server" — postQuestionAction, postAnswerAction
    ask/
      page.tsx                          # panel 2 — ask form (canonical route)
      loading.tsx
      error.tsx
    cxc-ai/
      page.tsx                          # panel 4 — new chat (creates session, redirects)
      loading.tsx
      error.tsx
      [chatId]/
        page.tsx                        # panel 4 — resume chat
        loading.tsx
        error.tsx
    api/
      questions/
        route.ts                        # GET list, POST create
        [questionId]/
          route.ts                      # GET detail
          answers/
            route.ts                    # POST add answer
      search/
        route.ts                        # GET internal search
      cxc-ai/
        route.ts                        # POST stream — AI SDK chat
        chats/
          [chatId]/
            route.ts                    # GET snapshot
            messages/
              route.ts                  # POST persist messages + sources

  features/                             # feature-owned UI modules. Bulk of frontend lives here.
    shell/
      components/
        top-command-bar.tsx
        topic-rail.tsx
        page-shell.tsx
      index.ts
    questions/
      components/
        question-feed.tsx
        question-row.tsx
        question-detail.tsx
        answer-list.tsx
        answer-composer.tsx
        question-empty-state.tsx
      hooks/
        use-questions.ts
      types/
        questions.types.ts
      index.ts
    ask/
      components/
        ask-form.tsx
        tag-chip-input.tsx
      types/
        ask.types.ts
      index.ts
    cxc-ai/
      components/
        chat-shell.tsx
        message-list.tsx
        message-composer.tsx
        source-pill.tsx
        ask-community-draft-card.tsx
      hooks/
        use-cxc-chat.ts
      types/
        cxc.types.ts
      index.ts

  server/                               # backend orchestration. No React. No client imports.
    questions/
      questions.service.ts              # createQuestion, listQuestionsForFeed, getQuestionDetail
      questions.queries.ts              # read wrappers around @cardinalxchange/db
      questions.mutations.ts            # write wrappers
      questions.types.ts                # server-internal types (DTOs live in http/contracts.ts)
      index.ts
    answers/
      answers.service.ts                # addAnswer, listAnswers
      answers.mutations.ts
      answers.types.ts
      index.ts
    search/
      search.service.ts
      search.queries.ts
      search.types.ts
      index.ts
    cxc-ai/
      agents/
        prompts/
          system.prompt.ts
          ask-the-community.prompt.ts
          index.ts
        cxc.agent.ts
        index.ts
      services/
        chat.service.ts                 # stream + persist
        retrieval.service.ts            # public Q&A only, capped, source-labeled
        web-context.service.ts          # opt-in WEB_CONTEXT_ENDPOINT; no-op if unset
        index.ts
      types/
        cxc.types.ts
        index.ts
      index.ts
    http/
      http.ts                           # HttpError, jsonOk, jsonError, readPayload
      inputs.ts                         # zod parsers; throw HttpError on failure
      contracts.ts                      # wire DTOs imported by both server and client
      index.ts
    index.ts

  lib/                                  # tiny app-local stubs only (must NOT host backend logic)
    viewer.ts
    index.ts

  utils/                                # generic, pure, framework-free helpers
    format-date.ts
    text.ts
    index.ts

  data/                                 # static, build-time data (topic list, etc.)
    topics.data.ts
    index.ts

  scripts/                              # dev/ops scripts (not bundled)
    check-env.ts

  middleware.ts                         # Next middleware (placeholder; empty for build 1)
  next.config.ts
  next-env.d.ts
  postcss.config.mjs
  tsconfig.json
  package.json

packages/
  db/
    prisma/
      schema.prisma
      migrations/
      seed.mjs                          # kept as a no-op shim; per CLAUDE.md no fixtures are seeded
    src/
      client.ts                         # PrismaClient singleton + adapter
      questions.queries.ts              # listQuestionRecords, getQuestionRecord, searchQuestionRecords
      questions.mutations.ts            # createQuestionRecord
      answers.queries.ts                # listAnswerRecords
      answers.mutations.ts              # createAnswerRecord
      cxc.queries.ts                    # AiChatSession reads
      cxc.mutations.ts                  # ensureAiChatSessionRecord, replaceAiChatSessionMessages
      types.ts                          # re-exports of generated Prisma types + record types
      index.ts                          # barrel
    package.json
    prisma.config.ts
    tsconfig.json

  ui/                                   # client-safe primitives only
    src/
      tokens/
        colors.ts
        spacing.ts
        radius.ts
        typography.ts
        index.ts
      primitives/
        button.tsx
        badge.tsx
        surface.tsx
        input.tsx
        textarea.tsx
        tag.tsx
        icon-button.tsx
        divider.tsx
        pill.tsx
        index.ts
      utils/
        cn.ts
        index.ts
      design.ts                         # static designSystem export composed from tokens
      index.ts                          # barrel
    package.json
    tsconfig.json

  config/
    tsconfig/
      base.json
      next.json                         # renamed from nextjs.json — see Naming Audit
      package.json
    eslint/
      index.mjs                         # placeholder for future shared ESLint config

docs/
  architecture.md
  build/
    README.md
    00-orchestration.md
    01-organization.md
    02-backend.md
    03-frontend.md
    04-design.md
    proposals/
      structure-proposal.md             # this file
      structure-critique.md             # written by Critic
```

## 2. Per-Folder Rationale (one line each)

- `apps/web/app/` — Next.js App Router routes, layouts, route handlers; thin glue only.
- `apps/web/app/api/` — HTTP boundary for the four read/write surfaces in panels 1–4.
- `apps/web/features/` — feature-owned frontend (components, hooks, view models) grouped by product surface.
- `apps/web/features/shell/` — page chrome (top command bar, left rail, page shell) shared across all four panels per the image.
- `apps/web/features/questions/` — feed row, detail header, answer list, answer composer (panels 1 + 3).
- `apps/web/features/ask/` — ask form + tag chip input (panel 2).
- `apps/web/features/cxc-ai/` — full-page chat UI, source pills, transient `Ask the Community` draft card (panel 4).
- `apps/web/server/` — server-only orchestration (use cases, queries, mutations, AI). Never imports React or `packages/ui`.
- `apps/web/server/http/` — wire boundary: zod parsers, `HttpError`, and the **single home** for cross-wire DTO contracts.
- `apps/web/server/cxc-ai/` — strict three-folder split (agents / services / types) so prompts, retrieval, and persistence are all independently testable.
- `apps/web/lib/` — tiny app-local stubs (`viewer.ts` only). Architecture doc explicitly bans backend logic here.
- `apps/web/utils/` — pure, framework-free helpers (date formatting, text shaping). No React, no DB.
- `apps/web/data/` — static literal data (e.g., topic rail labels). Build-time only; not a runtime store.
- `apps/web/scripts/` — dev/ops scripts (env check, etc.); not bundled into Next output.
- `packages/db/` — Prisma schema, migrations, generated client, query helpers; the only place that knows about Postgres.
- `packages/ui/` — client-safe primitives + design tokens; no server, db, or AI imports.
- `packages/config/` — shared TS configs consumed via `@cardinalxchange/config/tsconfig/*`.
- `docs/` — canonical product/architecture spec; `docs/build/` is the per-agent build plan; `docs/build/proposals/` holds proposer/critic artifacts.

## 3. Deviations From `01-organization.md`

The brief is followed almost exactly. The deviations below are additive (new folders/files explicitly allowed by the brief's intent) or renames noted in the brief's spec but missing from its tree.

| # | Deviation | Rationale |
|---|-----------|-----------|
| D1 | Add `app/fonts.ts` and per-route `loading.tsx` / `error.tsx` (and root `not-found.tsx`). | `04-design.md` requires `next/font` definitions, and `03-frontend.md` requires loading + error states for every route. The brief's tree showed `layout.tsx` and `globals.css` only; this surfaces the rest explicitly so the Implementer creates the files. |
| D2 | Split `app/api/cxc-ai/` into `route.ts` (stream) and `chats/[chatId]/route.ts` + `chats/[chatId]/messages/route.ts`. | The current code already has this surface (snapshot read + persist write), and the AI SDK pattern needs a stream endpoint distinct from a persistence endpoint. The brief's single `cxc-ai/route.ts` would force overloading. |
| D3 | Add `server/answers/` as a sibling of `server/questions/`. | The brief lists this folder; including it explicitly here so the Critic doesn't flag it as missing. (No deviation — restated for clarity.) |
| D4 | Add `packages/db/src/questions.mutations.ts` and `answers.mutations.ts`. | The brief only listed `*.queries.ts` for the db package, but `02-backend.md` separates write paths from read paths in `apps/web/server`; mirroring that separation in `packages/db` keeps both layers symmetric. The brief's barrel rule still applies. |
| D5 | Rename `packages/config/tsconfig/nextjs.json` → `next.json`. | The brief's tree shows `next.json`; current file is `nextjs.json`. See Naming Audit. |
| D6 | Add `packages/db/src/cxc.mutations.ts` (separate from `cxc.queries.ts`). | Same symmetry argument as D4. The current monolithic `packages/db/src/index.ts` mixes both; splitting keeps file roles legible per the suffix convention. |
| D7 | Keep `packages/db/prisma/seed.mjs` as a no-op shim, not delete it. | `CLAUDE.md` and the user memory file forbid seed fixtures, but the prisma config still references the seed script. Leaving it as an empty placeholder avoids breaking `prisma db seed` while staying compliant. The Implementer should reduce it to a comment + `process.exit(0)`. |
| D8 | Add `app/questions/actions.ts` (server actions for question/answer submission). | The brief routes everything through `app/api/*/route.ts`, but `03-frontend.md` describes form submission flows that are simpler with server actions, and the current code already uses this pattern. Server actions and route handlers can coexist; both call into `server/<feature>.service`. The Critic may reasonably reduce this to one or the other; flagged in Open Questions. |
| D9 | Add `features/questions/components/question-empty-state.tsx`, `features/ask/components/tag-chip-input.tsx`, `features/cxc-ai/components/ask-community-draft-card.tsx`. | These are explicit panel requirements from `03-frontend.md` (empty states, tag chip input, draft card from `Ask the Community`). The brief's tree omitted them; surfacing here so they don't end up inlined in route files. |

No deviations on naming conventions, barrel rule, or boundary rules.

## 4. File Moves (`git mv` semantics)

| Current path | Proposed path |
|--------------|---------------|
| `apps/web/components/top-command-bar.tsx` | `apps/web/features/shell/components/top-command-bar.tsx` |
| `apps/web/components/topic-rail.tsx` | `apps/web/features/shell/components/topic-rail.tsx` |
| `apps/web/components/question-feed.tsx` | `apps/web/features/questions/components/question-feed.tsx` |
| `apps/web/components/question-row.tsx` | `apps/web/features/questions/components/question-row.tsx` |
| `apps/web/components/ask-question-entry.tsx` | *(delete after migration — superseded by the new feed empty state + the panel-2 ask form. Listed here as a deletion, not a move.)* |
| `apps/web/features/cxc-ai/cxc-ai-chat.tsx` | `apps/web/features/cxc-ai/components/chat-shell.tsx` (split into `chat-shell.tsx`, `message-list.tsx`, `message-composer.tsx`, `source-pill.tsx` during the Backend/Frontend phases — Implementer only does the `git mv`; the split happens later) |
| `apps/web/features/README.md` | *(remove — replaced by per-feature `index.ts` barrels)* |
| `apps/web/server/README.md` | *(remove — replaced by `server/index.ts` barrel)* |
| `apps/web/server/contracts.ts` | `apps/web/server/http/contracts.ts` |
| `apps/web/server/http.ts` | `apps/web/server/http/http.ts` |
| `apps/web/server/inputs.ts` | `apps/web/server/http/inputs.ts` |
| `apps/web/server/actions.ts` | split: `apps/web/server/questions/questions.service.ts` (createQuestion) + `apps/web/server/answers/answers.service.ts` (addAnswer). The Implementer performs `git mv` of the file to `questions/questions.service.ts` first, then a follow-up extraction commit. |
| `apps/web/server/questions.ts` | `apps/web/server/questions/questions.service.ts` (the read paths). The current file mixes service + query wrappers; Implementer splits into `questions.queries.ts` after the move. |
| `apps/web/server/cxc-ai/contracts.ts` | `apps/web/server/cxc-ai/types/cxc.types.ts` (internal types). Wire DTOs that cross to the client move to `apps/web/server/http/contracts.ts`. |
| `apps/web/server/cxc-ai/service.ts` | `apps/web/server/cxc-ai/agents/cxc.agent.ts` (system prompt builder + tool factory + fallback). The retrieval helper inside it stays imported from the new `services/retrieval.service.ts`. |
| `apps/web/server/cxc-ai/retrieval.ts` | `apps/web/server/cxc-ai/services/retrieval.service.ts` |
| `apps/web/server/cxc-ai/store.ts` | `apps/web/server/cxc-ai/services/chat.service.ts` |
| `apps/web/app/questions/actions.ts` | `apps/web/app/questions/actions.ts` (no move; flagged in Open Questions because the brief locates submissions on `app/api/*` instead) |
| `apps/web/app/ask/page.tsx` | `apps/web/app/ask/page.tsx` (already canonical per the brief) |
| `apps/web/app/questions/ask/page.tsx` | *(delete — duplicate of `/ask`. The legacy redirect at `app/ask/page.tsx` should be removed too once both are reconciled. See Open Questions Q3.)* |
| `apps/web/app/api/cxc-ai/chat/route.ts` | `apps/web/app/api/cxc-ai/route.ts` |
| `apps/web/app/api/cxc-ai/chats/[chatId]/route.ts` | `apps/web/app/api/cxc-ai/chats/[chatId]/route.ts` (no move) |
| `apps/web/app/api/cxc-ai/chats/[chatId]/messages/route.ts` | `apps/web/app/api/cxc-ai/chats/[chatId]/messages/route.ts` (no move) |
| `apps/web/app/api/ai/answer/` (directory) | *(delete — empty leftover, no code)* |
| `apps/web/app/api/ask/` (directory) | *(delete — empty leftover, no code)* |
| `apps/web/app/api/questions/[questionId]/ai-answer/` (directory) | *(delete — empty leftover, no code; `/cxc-ai` owns AI surfaces per architecture doc)* |
| `apps/web/app/api/questions/[questionId]/publish/` (directory) | *(delete — empty leftover; no separate publish step in MVP)* |
| `apps/web/lib/viewer.ts` | `apps/web/lib/viewer.ts` (no move) |
| `packages/db/src/index.ts` | split into the files listed under `packages/db/src/` in section 1. Implementer keeps `index.ts` as the barrel and extracts `client.ts`, `questions.queries.ts`, `questions.mutations.ts`, `answers.queries.ts`, `answers.mutations.ts`, `cxc.queries.ts`, `cxc.mutations.ts`, `types.ts` via `git mv` of a copy then cleanup. |
| `packages/ui/src/badge.tsx` | `packages/ui/src/primitives/badge.tsx` |
| `packages/ui/src/button.tsx` | `packages/ui/src/primitives/button.tsx` |
| `packages/ui/src/surface.tsx` | `packages/ui/src/primitives/surface.tsx` |
| `packages/ui/src/utils.ts` | `packages/ui/src/utils/cn.ts` |
| `packages/ui/src/design.ts` | `packages/ui/src/design.ts` (no move; stays as the static `designSystem` export per `04-design.md`. Token files in `tokens/` are new and the Implementer leaves them empty for the Design-System Agent.) |
| `packages/config/tsconfig/nextjs.json` | `packages/config/tsconfig/next.json` |

Every folder boundary above gets a new `index.ts` barrel created by the Implementer (initially `export {};` per `01-organization.md`'s Implementer contract).

## 5. Naming Audit

Files whose current names do not match the conventions in `01-organization.md`. Convention recap: kebab-case files; suffixes (`*.types.ts`, `*.service.ts`, `*.queries.ts`, `*.mutations.ts`, `*.agent.ts`, `*.prompt.ts`, `*.data.ts`).

| Current path | Issue | Proposed path |
|--------------|-------|---------------|
| `apps/web/server/contracts.ts` | Missing role suffix; lives outside `http/` boundary. | `apps/web/server/http/contracts.ts` |
| `apps/web/server/http.ts` | File-name collides with the folder concept; brief expects it inside `server/http/`. | `apps/web/server/http/http.ts` |
| `apps/web/server/inputs.ts` | Should live under `server/http/`. | `apps/web/server/http/inputs.ts` |
| `apps/web/server/actions.ts` | "actions" is not a defined role suffix; mixes question + answer service code. | Split into `server/questions/questions.service.ts` and `server/answers/answers.service.ts`. |
| `apps/web/server/questions.ts` | No role suffix; mixes service + query wrappers. | Split into `server/questions/questions.service.ts` (orchestration) and `server/questions/questions.queries.ts` (db wrappers). |
| `apps/web/server/cxc-ai/service.ts` | Generic name; doesn't reflect agent role. | `server/cxc-ai/agents/cxc.agent.ts` |
| `apps/web/server/cxc-ai/store.ts` | "store" is not a defined suffix; this is the chat persistence service. | `server/cxc-ai/services/chat.service.ts` |
| `apps/web/server/cxc-ai/retrieval.ts` | Missing `.service.ts` suffix. | `server/cxc-ai/services/retrieval.service.ts` |
| `apps/web/server/cxc-ai/contracts.ts` | Wire vs. internal split is unclear; `01-organization.md` keeps wire DTOs in `server/http/contracts.ts`. | `server/cxc-ai/types/cxc.types.ts` (internal); any wire DTOs are merged into `server/http/contracts.ts`. |
| `apps/web/components/*.tsx` | Top-level `components/` folder is type-grouped, not feature-grouped. | Each file moves to a feature module (see section 4). The folder itself goes away. |
| `apps/web/features/cxc-ai/cxc-ai-chat.tsx` | Lives at feature root, not inside `components/`; name duplicates the feature folder. | `features/cxc-ai/components/chat-shell.tsx` (then split per `03-frontend.md`). |
| `packages/db/src/index.ts` | Single 521-line file mixes client, queries, mutations, type re-exports. Convention requires role-suffixed files. | Split into `client.ts`, `questions.queries.ts`, `questions.mutations.ts`, `answers.queries.ts`, `answers.mutations.ts`, `cxc.queries.ts`, `cxc.mutations.ts`, `types.ts`, `index.ts` (barrel). |
| `packages/ui/src/utils.ts` | Generic name; tokens/utilities convention puts utilities under `utils/`. | `packages/ui/src/utils/cn.ts` |
| `packages/ui/src/badge.tsx`, `button.tsx`, `surface.tsx` | Live at `src/` root rather than under `primitives/`. | `packages/ui/src/primitives/{badge,button,surface}.tsx` |
| `packages/config/tsconfig/nextjs.json` | Brief's tree calls this `next.json`. | `packages/config/tsconfig/next.json` (and update `apps/web/tsconfig.json` extends path). |
| `apps/web/features/README.md`, `apps/web/server/README.md` | README markdown inside source folders is not part of the convention; barrels are. | Delete. |

No PascalCase filenames found; no `*Service.ts` style violations. The current code already uses kebab-case for components and routes.

## 6. Open Questions

These should be resolved before the Implementer writes the skeleton, or explicitly deferred by the Critic.

1. **Server actions vs. route handlers for writes.** `02-backend.md` directs every write through `app/api/*/route.ts`, but the current code (and the simplest Next idiom for forms) uses `app/questions/actions.ts` server actions. The proposal keeps `actions.ts` as a thin wrapper over `server/<feature>.service.ts` and **adds** the route handler so the API surface exists for non-form clients. Critic should confirm whether to keep both, drop the server actions, or drop the route handlers.

2. **Question slug vs. ID in the URL.** Current code uses slug at `/questions/[questionId]` (param name is `questionId` but receives a slug). The image's URL bar is unreadable on the question-detail panel. Proposal: keep `[questionId]` accepting either a `cuid` or a slug (matches existing `questionIdentityWhere` in `packages/db/src/index.ts`). Flagging because a future move to canonical slugs would change the route shape.

3. **Two ask routes exist today (`/ask` and `/questions/ask`).** The image's panel 2 shows a centered `Ask a Question` form but does not show the URL. The brief's tree says `/ask`. Proposal deletes `app/questions/ask/page.tsx` and the legacy redirect at `app/ask/page.tsx` is replaced with the real form. Critic should confirm `/ask` is the canonical URL (matches the brief; flagged because the current `TopCommandBar` and `ask-question-entry` components link to `/questions/ask`).

4. **`features/shell/` vs. continuing `apps/web/components/` for chrome.** The image shows the same chrome on every panel, which makes it a feature module by the brief's definition. Proposal puts shell components under `features/shell/`. The brief's tree allows this explicitly; flagging because Stage 0 currently keeps them in `components/`.

5. **`packages/db/prisma/seed.mjs`.** `CLAUDE.md` and user memory both say no seed data, but the file exists and `prisma.config.ts` may reference it. Proposal: keep the file as an empty no-op so `prisma db seed` does not fail in workflows that expect it. Critic should confirm; alternatively delete the file and the script entry.

6. **`Ask the Community` draft transport.** Per `03-frontend.md`, the CXC AI panel routes a draft to `/ask?draft=…`. The transient draft is therefore encoded in the URL query string (or in a transient client store like `sessionStorage`). The image is silent on this. Proposal keeps it in the URL for shareability but flags this for the Frontend Agent — no skeleton change is needed.

7. **Image vs. doc — left rail labels.** The image shows `CXC AI · Questions · Topics · Trending` in the left rail; the current `TopicRail` component shows `Questions · CXC AI · Ask Question`. The image wins per the orchestration rule. Proposal keeps the rail in `features/shell/` and lets the Frontend Agent reconcile labels; no skeleton change needed but flagging so the Critic does not bless the wrong label set.

8. **`app/(marketing)/` route group.** The brief lists it as conditional ("if added"). No marketing surface exists in the image. Proposal omits it from the skeleton; Critic to confirm.

---

End of proposal. The Implementer should not begin work until the Critic produces `docs/build/proposals/structure-critique.md`.
