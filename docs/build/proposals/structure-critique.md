# Structure Critique — Build 1

Author: Structure Critic agent
Reviewing: `docs/build/proposals/structure-proposal.md`
Contract: `docs/build/01-organization.md`

## 1. Verdict

`accept with required changes` — The proposed tree is materially aligned with `01-organization.md`. There is one boundary violation, several smaller naming/barrel issues, two single-file folders that should not be created empty, and one open question that must be locked before the Implementer runs `git mv`.

---

## 2. Block-Level Issues

1. **`apps/web/server/cxc-ai/types/cxc.types.ts` re-imports from `ai` (UIMessage), which Tier risks `server/**` pulling client-side types into a `types/*.types.ts` file.**
   - File: `apps/web/server/cxc-ai/types/cxc.types.ts` (proposal target for current `apps/web/server/cxc-ai/contracts.ts`).
   - Rule violated: `01-organization.md` "Shared Types Policy" — types crossing the wire belong in `server/http/contracts.ts`. The current `contracts.ts` exports `AiChatSession`, `AiChatMessage`, `AiChatSource`, `AskCommunityDraft` and they are consumed by the client (`features/cxc-ai/cxc-ai-chat.tsx`). The proposal moves all of them into `server/cxc-ai/types/cxc.types.ts`, which means the client would either deep-import past the `server/cxc-ai` boundary (illegal) or `features/**` would import from `@/server/cxc-ai/types` instead of `@/server/http`.
   - Fix: Move the four cross-wire DTOs (`AiChatSession`, `AiChatMessage`, `AiChatSource`, `AskCommunityDraft`, plus `AiChatSourceKind`) into `apps/web/server/http/contracts.ts`. Reserve `server/cxc-ai/types/cxc.types.ts` for *internal* server types only (e.g. retrieval row shape, agent invocation context). The `import type { UIMessage } from "ai"` is a wire type and belongs in `http/contracts.ts`.

2. **`apps/web/app/questions/actions.ts` — server action surface vs. route-handler surface must be picked, not double-stacked.**
   - Files: `apps/web/app/questions/actions.ts` and `apps/web/app/api/questions/route.ts` + `apps/web/app/api/questions/[questionId]/answers/route.ts`.
   - Rule violated: `01-organization.md` "One obvious place for every kind of file." `02-backend.md` says every write goes through `app/api/*/route.ts`; `03-frontend.md` panel 2 also says "Submit posts to `POST /api/questions`." The proposal keeps both, deferring the question to the Critic. Allowing both creates two homes for the same write path and contradicts the contract.
   - Fix: Delete `apps/web/app/questions/actions.ts`. Submissions on panels 2 and 3 use `fetch('/api/questions', …)` / `fetch('/api/questions/[id]/answers', …)` from the form components per `02-backend.md` and `03-frontend.md`. Update Open Question Q1 accordingly. (See §4.)

3. **`apps/web/app/questions/ask/page.tsx` is the URL the existing `top-command-bar.tsx` and `ask-question-entry.tsx` link to. Deleting the route without a redirect breaks the running dev shell.**
   - File: `apps/web/app/questions/ask/page.tsx` (delete) plus `apps/web/components/top-command-bar.tsx` and `apps/web/components/ask-question-entry.tsx` (callers).
   - Rule violated: Implementer is supposed to run `git mv`, type-check, and ship. A bare delete leaves the moved `top-command-bar.tsx` (now in `features/shell/components/`) compiling but linking to a 404.
   - Fix: Two options — (a) rewrite the `Link href="/questions/ask"` references to `/ask` as part of the same skeleton commit so type-check + dev still load, or (b) keep `app/questions/ask/page.tsx` as a 1-line `redirect('/ask')` until the Frontend Agent rewires links. Either is fine; the Implementer must do one of them, not just delete.

4. **`apps/web/scripts/check-env.ts` is a single-file folder with no second occupant on the horizon and no equivalent in `01-organization.md`'s tree as a *populated* folder.**
   - Path: `apps/web/scripts/`.
   - Rule violated: "Single-file folders that exist with one file and no clear future expansion" (Critic checklist).
   - Fix: Either drop the folder from the empty skeleton (the Implementer creates it only when the first script lands) or move `check-env.ts` to `packages/db`/root `scripts/` if it is db-shaped. Recommendation: omit `scripts/` from the empty skeleton; let the agent that needs it create it. (`01-organization.md` lists it but does not require an empty placeholder.)

5. **`apps/web/data/topics.data.ts` is a single-file folder created empty with no current data source.**
   - Path: `apps/web/data/`.
   - Rule violated: Same single-file-folder rule. The image's left rail shows `CXC AI · Questions · Topics · Trending` — those four labels are not enough payload to justify its own folder yet, and `topics.data.ts` is currently the only proposed file.
   - Fix: Allowed by the brief, but if the Implementer creates the folder it must contain `topics.data.ts` with the four labels (`CXC AI`, `Questions`, `Topics`, `Trending`) wired into `features/shell/components/topic-rail.tsx`. Otherwise, omit. Pick one.

6. **`packages/db/src/index.ts` split — `cxc.mutations.ts` mirrors a write path that does not exist as a separate function in the current `index.ts`; the proposed split risks an empty file.**
   - File: `packages/db/src/cxc.mutations.ts` (new).
   - Rule violated: Single-file-folder spirit — but worse, an *empty* file. The current monolithic `packages/db/src/index.ts` contains `ensureAiChatSessionRecord` and `replaceAiChatSessionMessages`, which are writes; D6 is correct that these need a `.mutations.ts` home. The risk is the Implementer creates `cxc.mutations.ts` as `export {}` and ships an empty file.
   - Fix: The skeleton phase explicitly requires `export {}` placeholders, so this is acceptable, but the Implementer must port `ensureAiChatSessionRecord` and `replaceAiChatSessionMessages` to `cxc.mutations.ts` *in the same skeleton commit* (they already exist; this is `git mv`-shaped code movement, not feature work). Otherwise the tree fails the spec's "no single-file folders" / "every file has a real role" intent.

7. **`apps/web/middleware.ts` — empty placeholder file in skeleton phase will be flagged by Next as "not exporting middleware" at runtime if `matcher` is unset and the file exists.**
   - File: `apps/web/middleware.ts`.
   - Rule violated: Convention. Next.js requires a default export of `function middleware`. An empty `export {}` will warn or error at dev start, regressing `pnpm dev`.
   - Fix: Omit `middleware.ts` from the skeleton entirely. Add it only when a real middleware (auth, rate limit, etc.) lands. `01-organization.md` lists it as "if any" — there is no "any" in build 1.

8. **`packages/config/eslint/index.mjs` is a single-file folder with no consumers wired up.**
   - File: `packages/config/eslint/index.mjs`.
   - Rule violated: Single-file folder rule + the proposal admits it is a "placeholder for future shared ESLint config" with no current usage. The repo root already has `eslint.config.mjs`.
   - Fix: Drop `packages/config/eslint/` from the skeleton until a real shared ESLint config exists. Keep `packages/config/tsconfig/` only.

---

## 3. Nit-Level Issues

1. **`features/cxc-ai/components/ask-community-draft-card.tsx` is named after a UI affordance, not the feature noun.**
   - Path: `apps/web/features/cxc-ai/components/ask-community-draft-card.tsx`.
   - Rule violated: Naming is fine; nit is the slight overlap with `features/ask/components/ask-form.tsx` — both are "ask" things in different folders. Acceptable, but the Frontend Agent should be aware.
   - Fix (optional): Rename to `community-draft-card.tsx` to make ownership less ambiguous. Acceptable to ship as proposed.

2. **`packages/db/prisma/seed.mjs` retention.**
   - Path: `packages/db/prisma/seed.mjs`.
   - Rule violated: User memory says no seed data; retaining the file is fine but `prisma db seed` is not on the documented runbook.
   - Fix: Replace the body with a comment + `process.exit(0)` per D7. Nit because it is harmless either way.

3. **`apps/web/server/cxc-ai/agents/prompts/index.ts` — barrel inside a leaf folder of single-purpose strings.**
   - Path: `apps/web/server/cxc-ai/agents/prompts/index.ts`.
   - Rule violated: None strictly, but the brief's barrel rule applies to module boundaries (`features/*`, `server/*`, `packages/*/src`), not every leaf folder. A barrel here is harmless.
   - Fix: Acceptable. Keep.

4. **`apps/web/features/shell/components/page-shell.tsx` — confirm the file is referenced by `app/layout.tsx`, not inlined.**
   - Path: `apps/web/features/shell/components/page-shell.tsx`.
   - Rule violated: None; flagged so the Implementer wires `app/layout.tsx` to use it.
   - Fix: Acceptable. Document in the Completion Note.

5. **`packages/ui/src/primitives/index.ts` and `packages/ui/src/utils/index.ts` are not in `01-organization.md`'s tree but are required by the barrel rule.**
   - Paths: `packages/ui/src/primitives/index.ts`, `packages/ui/src/utils/index.ts`.
   - Rule violated: Brief lists `packages/ui/src/utils/cn.ts` without an `index.ts`. Barrel rule says "every `packages/*/src` boundary" — leaf folders inside `src` aren't strictly required, but consistency is nice.
   - Fix: Acceptable to add. The proposal does add them. Keep.

6. **`apps/web/lib/index.ts` — `lib/` has only one occupant (`viewer.ts`).**
   - Path: `apps/web/lib/index.ts`.
   - Rule violated: Single-file folder. But `01-organization.md` explicitly lists `lib/viewer.ts`, and there is real intent for it to host other tiny stubs.
   - Fix: Acceptable; the brief authorizes it. Keep.

7. **`packages/db/src/types.ts` is named without a role suffix even though every other db file has one.**
   - Path: `packages/db/src/types.ts`.
   - Rule violated: Brief actually lists `types.ts` (no `*.types.ts` suffix) for `packages/db/src/`. So technically conformant.
   - Fix: Acceptable. Note: the suffix convention is `*.types.ts` in feature folders; for the db barrel root, `types.ts` is what the brief itself uses.

---

## 4. Open Question Recommendations

1. **Server actions vs. route handlers** — `block`. **Drop server actions.** `02-backend.md` and `03-frontend.md` both say writes go through `app/api/*/route.ts`. Delete `app/questions/actions.ts`. Form components fetch the API. (Resolved as Block §2.)

2. **Slug vs. ID in `[questionId]`** — `defer`. Keep the param name `questionId` accepting either a CUID or a slug as the current `questionIdentityWhere` helper does. Slug-only canonicalization is a Backend Agent decision; no skeleton change is required.

3. **Two ask routes (`/ask` vs `/questions/ask`)** — `block`. **`/ask` is canonical** (matches the brief). Delete `app/questions/ask/page.tsx` *and* update `top-command-bar.tsx` + `ask-question-entry.tsx` link targets in the same commit. (Resolved as Block §3.)

4. **`features/shell/` vs `apps/web/components/`** — `nit`. **Use `features/shell/`.** The image shows the same chrome on every panel, so it is a feature module. The brief authorizes this explicitly. Move `top-command-bar.tsx`, `topic-rail.tsx` into `features/shell/components/` and delete `apps/web/components/`. (Already in the proposal.)

5. **`packages/db/prisma/seed.mjs` retention** — `nit`. **Keep the file as a no-op shim** with `process.exit(0)`. Removing it would require also editing `packages/db/package.json`'s prisma seed config; not worth it for the skeleton phase.

6. **Ask-the-Community draft transport** — `defer`. URL query string (`/ask?draft=…`) is fine for shareability. No skeleton change needed. Frontend Agent owns this.

7. **Image vs. doc — left rail labels** — `block` for the skeleton barrel only insofar as `data/topics.data.ts` decides them. **Use the image's labels**: `CXC AI`, `Questions`, `Topics`, `Trending`. The doc's "Ask Question" goes on the top-bar button, not the rail. The Implementer wires this when creating `data/topics.data.ts`; if the data folder is omitted (Block §5), the labels live inline in `topic-rail.tsx`.

8. **`app/(marketing)/` route group** — `defer`. **Omit.** No marketing surface in the image and no auth flow yet. Not needed for build 1.

---

## 5. Hallucination Check

I verified every "from" path in the proposal's File Moves section against the working tree.

| Proposed source path | Exists? |
|----------------------|---------|
| `apps/web/components/top-command-bar.tsx` | exists |
| `apps/web/components/topic-rail.tsx` | exists |
| `apps/web/components/question-feed.tsx` | exists |
| `apps/web/components/question-row.tsx` | exists |
| `apps/web/components/ask-question-entry.tsx` | exists |
| `apps/web/features/cxc-ai/cxc-ai-chat.tsx` | exists |
| `apps/web/features/README.md` | exists |
| `apps/web/server/README.md` | exists |
| `apps/web/server/contracts.ts` | exists |
| `apps/web/server/http.ts` | exists |
| `apps/web/server/inputs.ts` | exists |
| `apps/web/server/actions.ts` | exists |
| `apps/web/server/questions.ts` | exists |
| `apps/web/server/cxc-ai/contracts.ts` | exists |
| `apps/web/server/cxc-ai/service.ts` | exists |
| `apps/web/server/cxc-ai/retrieval.ts` | exists |
| `apps/web/server/cxc-ai/store.ts` | exists |
| `apps/web/app/questions/actions.ts` | exists |
| `apps/web/app/ask/page.tsx` | exists |
| `apps/web/app/questions/ask/page.tsx` | exists |
| `apps/web/app/api/cxc-ai/chat/route.ts` | exists |
| `apps/web/app/api/cxc-ai/chats/[chatId]/route.ts` | exists |
| `apps/web/app/api/cxc-ai/chats/[chatId]/messages/route.ts` | exists |
| `apps/web/app/api/ai/answer/` | exists (empty dir) |
| `apps/web/app/api/ask/` | exists (empty dir) |
| `apps/web/app/api/questions/[questionId]/ai-answer/` | exists (empty dir) |
| `apps/web/app/api/questions/[questionId]/publish/` | exists (empty dir) |
| `apps/web/lib/viewer.ts` | exists |
| `packages/db/src/index.ts` | exists |
| `packages/ui/src/badge.tsx` | exists |
| `packages/ui/src/button.tsx` | exists |
| `packages/ui/src/surface.tsx` | exists |
| `packages/ui/src/utils.ts` | exists |
| `packages/ui/src/design.ts` | exists |
| `packages/config/tsconfig/nextjs.json` | exists |

**No hallucinated paths.** Every "from" in the proposal maps to a real file or directory on disk today. The four "delete empty leftover" directories under `app/api/` are confirmed empty (`ls` returns no entries). Note that the proposal did *not* mention `apps/web/app/page.tsx` (root redirect) or `apps/web/app/cxc-ai/[chatId]/page.tsx` and `apps/web/app/cxc-ai/page.tsx`, all of which exist; the proposal's tree retains them implicitly under `app/cxc-ai/` and is consistent.

---

## 6. Final Tree After Fixes

This is the tree the Implementer should build, after applying every `block` resolution and every Open-Question recommendation above.

```
apps/web/
  app/
    layout.tsx
    page.tsx                                 # redirect → /questions
    globals.css
    fonts.ts                                 # next/font definitions (per 04-design)
    loading.tsx
    error.tsx
    not-found.tsx
    questions/
      page.tsx                               # panel 1
      loading.tsx
      error.tsx
      [questionId]/
        page.tsx                             # panel 3
        loading.tsx
        error.tsx
      ask/
        page.tsx                             # 1-line `redirect('/ask')` until link callers are rewired
    ask/
      page.tsx                               # panel 2 (canonical)
      loading.tsx
      error.tsx
    cxc-ai/
      page.tsx                               # panel 4 — new chat
      loading.tsx
      error.tsx
      [chatId]/
        page.tsx                             # panel 4 — resume
        loading.tsx
        error.tsx
    api/
      questions/
        route.ts                             # GET list, POST create
        [questionId]/
          route.ts                           # GET detail
          answers/
            route.ts                         # POST add answer
      search/
        route.ts                             # GET internal search
      cxc-ai/
        route.ts                             # POST stream
        chats/
          [chatId]/
            route.ts                         # GET snapshot
            messages/
              route.ts                       # POST persist messages + sources

  features/
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

  server/
    questions/
      questions.service.ts
      questions.queries.ts
      questions.mutations.ts
      questions.types.ts
      index.ts
    answers/
      answers.service.ts
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
        chat.service.ts
        retrieval.service.ts
        web-context.service.ts
        index.ts
      types/
        cxc.types.ts                         # internal types only
        index.ts
      index.ts
    http/
      http.ts
      inputs.ts
      contracts.ts                           # ALL wire DTOs incl. AiChatSession/Message/Source/AskCommunityDraft
      index.ts
    index.ts

  lib/
    viewer.ts
    index.ts

  utils/
    format-date.ts
    text.ts
    index.ts

  data/
    topics.data.ts                           # CXC AI · Questions · Topics · Trending (image-canonical)
    index.ts

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
      seed.mjs                               # no-op: process.exit(0)
    src/
      client.ts
      questions.queries.ts
      questions.mutations.ts
      answers.queries.ts
      answers.mutations.ts
      cxc.queries.ts
      cxc.mutations.ts                       # ensureAiChatSessionRecord, replaceAiChatSessionMessages (ported from index.ts)
      types.ts
      index.ts
    package.json
    prisma.config.ts
    tsconfig.json

  ui/
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
      design.ts
      index.ts
    package.json
    tsconfig.json

  config/
    tsconfig/
      base.json
      next.json                              # renamed from nextjs.json
      package.json

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
      structure-proposal.md
      structure-critique.md
```

### Things explicitly *not* in the skeleton

- `apps/web/middleware.ts` — omitted (Block §7).
- `apps/web/scripts/` — omitted (Block §4); add when the first script lands.
- `apps/web/components/` — deleted; everything moved into `features/`.
- `apps/web/features/README.md`, `apps/web/server/README.md` — deleted; replaced by barrels.
- `apps/web/app/questions/actions.ts` — deleted (Block §2).
- `packages/config/eslint/` — omitted (Block §8).
- `app/(marketing)/` — omitted (Open Q8).
- `apps/web/app/api/ai/`, `apps/web/app/api/ask/`, `apps/web/app/api/questions/[questionId]/ai-answer/`, `apps/web/app/api/questions/[questionId]/publish/` — deleted empty leftovers.

End of critique. Implementer: resolve §2 in order (boundary first, then route deduplication, then redirect bridge, then folder hygiene), run `pnpm typecheck`, fix only import paths.
