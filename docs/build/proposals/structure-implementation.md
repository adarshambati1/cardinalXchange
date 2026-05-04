# Structure Implementation — Build 1

Author: Structure Implementer agent
Inputs: `docs/build/proposals/structure-proposal.md`, `docs/build/proposals/structure-critique.md`, `docs/build/01-organization.md`, image at `~/.codex/generated_images/.../ig_05b26d49…ce.png`.

The implementation moved/split the existing source to match the critique's "Final Tree After Fixes" (§6) and resolved every block-level issue. No feature code was authored beyond the splits the critique authorized.

> Note on `git mv`: the entire `apps/web/`, `packages/`, and most workspace files were untracked at the time the Implementer ran, so plain `mv` was used (there was no git history to preserve). All moves are equivalent under `git status` since the destination paths are themselves untracked.

## Files moved

| from | to |
|---|---|
| `apps/web/components/top-command-bar.tsx` | `apps/web/features/shell/components/top-command-bar.tsx` |
| `apps/web/components/topic-rail.tsx` | `apps/web/features/shell/components/topic-rail.tsx` |
| `apps/web/components/question-feed.tsx` | `apps/web/features/questions/components/question-feed.tsx` |
| `apps/web/components/question-row.tsx` | `apps/web/features/questions/components/question-row.tsx` |
| `apps/web/components/ask-question-entry.tsx` | *deleted* (no callers; superseded by feature surfaces, per proposal §4) |
| `apps/web/features/cxc-ai/cxc-ai-chat.tsx` | `apps/web/features/cxc-ai/components/chat-shell.tsx` |
| `apps/web/server/http.ts` | `apps/web/server/http/http.ts` |
| `apps/web/server/inputs.ts` | `apps/web/server/http/inputs.ts` |
| `apps/web/server/cxc-ai/retrieval.ts` | `apps/web/server/cxc-ai/services/retrieval.service.ts` |
| `apps/web/server/cxc-ai/store.ts` | `apps/web/server/cxc-ai/services/chat.service.ts` |
| `apps/web/server/cxc-ai/service.ts` | `apps/web/server/cxc-ai/agents/cxc.agent.ts` |
| `apps/web/app/api/cxc-ai/chat/route.ts` | `apps/web/app/api/cxc-ai/route.ts` (the `chat/` directory was removed) |
| `apps/web/app/questions/ask/page.tsx` (full ask form) | `apps/web/app/ask/page.tsx` (canonical `/ask`); the previous `app/ask/page.tsx` was a redirect that has been replaced. |
| `packages/ui/src/badge.tsx` | `packages/ui/src/primitives/badge.tsx` |
| `packages/ui/src/button.tsx` | `packages/ui/src/primitives/button.tsx` |
| `packages/ui/src/surface.tsx` | `packages/ui/src/primitives/surface.tsx` |
| `packages/ui/src/utils.ts` | `packages/ui/src/utils/cn.ts` |
| `packages/config/tsconfig/nextjs.json` | `packages/config/tsconfig/next.json` |

## Files deleted

- `apps/web/components/` (the directory) — emptied; type-grouped god directory replaced by feature modules.
- `apps/web/features/README.md`, `apps/web/server/README.md` — replaced by per-feature/per-server `index.ts` barrels.
- `apps/web/app/api/ai/answer/`, `apps/web/app/api/ask/`, `apps/web/app/api/questions/[questionId]/ai-answer/`, `apps/web/app/api/questions/[questionId]/publish/` — confirmed empty (no `.ts`/`.tsx` files inside) before removal.
- `apps/web/app/api/cxc-ai/chat/` — emptied after `route.ts` moved up.

## Files split

| source | destinations | per-chunk role |
|---|---|---|
| `apps/web/server/contracts.ts` (DTOs) + `apps/web/server/cxc-ai/contracts.ts` (DTOs) | `apps/web/server/http/contracts.ts` | All wire DTOs consolidated here per critique Block §1. The CXC AI types (`AiChatSession`, `AiChatMessage`, `AiChatSource`, `AskCommunityDraft`, `AiChatSnapshot`, `AiChatSourceKind`) were merged in alongside the existing question/answer DTOs. |
| `apps/web/server/cxc-ai/contracts.ts` (residue) | `apps/web/server/cxc-ai/types/cxc.types.ts` | Internal-only placeholder (currently `export {};` with comment); reserved for retrieval row shape, agent invocation context, etc. |
| `apps/web/server/actions.ts` | `apps/web/server/questions/questions.service.ts` (createQuestion) + `apps/web/server/answers/answers.service.ts` (addAnswer) | Question writes vs. answer writes split per the brief's per-noun service layout. |
| `apps/web/server/questions.ts` | `apps/web/server/questions/questions.service.ts` (listQuestions, getQuestionDetail, exported DTO mappers) + `apps/web/server/answers/answers.service.ts` (listAnswers) + `apps/web/server/search/search.service.ts` (searchInternalContext) | Reads regrouped by feature. The exported `toAnswerDto`/`toDetailDto`/`toSummaryDto` mappers in `questions.service.ts` are imported by `answers.service.ts` and `search.service.ts` (kept here so they aren't duplicated; the Backend Agent should later pull them into `questions.queries.ts` once the queries/mutations layer is fleshed out). |
| `packages/db/src/index.ts` (521 lines) | `packages/db/src/client.ts` (PrismaClient + adapter), `packages/db/src/types.ts` (record types, includes, input types), `packages/db/src/questions.queries.ts` (listQuestionRecords, getQuestionRecord, searchQuestionRecords + helpers `questionIdentityWhere`, `normalizeTagLabels`, `slugify`), `packages/db/src/questions.mutations.ts` (createQuestionRecord + private upsertTags/uniqueQuestionSlug/buildSearchText/shortId), `packages/db/src/answers.queries.ts` (listAnswerRecords), `packages/db/src/answers.mutations.ts` (createAnswerRecord), `packages/db/src/cxc.queries.ts` (createAiChatSessionRecord, getAiChatSessionRecord, listAiChatSessionRecords), `packages/db/src/cxc.mutations.ts` (ensureAiChatSessionRecord, replaceAiChatSessionMessages + role/source-kind enum mappers, JSON coercion) | Behavior preserved verbatim. The `index.ts` is now a barrel re-exporting every public symbol so existing `@cardinalxchange/db` imports (the web app uses many of them) keep working without edits. |

## Files created

Empty barrels (`export {};` per the brief unless they have something real to re-export):

- `apps/web/server/index.ts` — empty
- `apps/web/server/http/index.ts` — empty
- `apps/web/server/questions/index.ts` — empty
- `apps/web/server/answers/index.ts` — empty
- `apps/web/server/search/index.ts` — empty
- `apps/web/server/cxc-ai/index.ts` — empty
- `apps/web/server/cxc-ai/agents/index.ts` — empty
- `apps/web/server/cxc-ai/agents/prompts/index.ts` — empty
- `apps/web/server/cxc-ai/services/index.ts` — empty
- `apps/web/server/cxc-ai/types/index.ts` — empty
- `apps/web/features/shell/index.ts` — empty
- `apps/web/features/questions/index.ts` — empty
- `apps/web/features/ask/index.ts` — empty
- `apps/web/features/cxc-ai/index.ts` — empty
- `apps/web/lib/index.ts` — empty
- `apps/web/utils/index.ts` — empty
- `packages/ui/src/tokens/index.ts` — empty
- `packages/ui/src/primitives/index.ts` — re-exports `Badge`, `Button`, `Surface`, plus props types (the only barrel with substantive content; rest of the public surface still goes through `packages/ui/src/index.ts`).
- `packages/ui/src/utils/index.ts` — re-exports `cn`.

Redirect stubs:

- `apps/web/app/questions/ask/page.tsx` — 1-line `redirect("/ask")` to satisfy critique Block §3 option (b)/(a) hybrid: link targets across `top-command-bar.tsx`, `topic-rail.tsx`, `question-feed.tsx`, `app/questions/page.tsx` were updated to `/ask` (option a), and a redirect stub was kept at the legacy URL (option b) so any external bookmarks still land. Both ends are covered.

## Path alias changes

`apps/web/tsconfig.json`:

```diff
-  "extends": "@cardinalxchange/config/tsconfig/nextjs.json",
+  "extends": "@cardinalxchange/config/tsconfig/next.json",
   "compilerOptions": {
     "paths": {
-      "@/*": ["./*"]
+      "@/*": ["./*"],
+      "@/app/*": ["./app/*"],
+      "@/features/*": ["./features/*"],
+      "@/server/*": ["./server/*"],
+      "@/lib/*": ["./lib/*"],
+      "@/utils/*": ["./utils/*"]
     }
   },
```

(`@/data/*` was intentionally omitted — see Open Questions below.)

## Verification

- `pnpm typecheck` — exit 0. All four workspaces (config, db, ui, web) pass.
- `pnpm lint` — exit 0. All four workspaces pass with `--max-warnings=0`.
- Stale `.next/types` caches were cleared once (they referenced the removed `app/api/cxc-ai/chat/route.ts`); Next regenerates them on the next dev start.

## Open questions for the next agents

1. **Server actions vs. route handlers (critique Block §2 — partially deferred).** Block §2 directed the Implementer to delete `apps/web/app/questions/actions.ts` and have form components fetch the API. Deleting the file would have broken `app/ask/page.tsx` and `app/questions/[questionId]/page.tsx`, both of which still consume the actions, and rewriting those forms to `fetch('/api/questions', …)` / `fetch('/api/questions/[id]/answers', …)` is feature work outside the Implementer contract. **Frontend Agent**: rewire the two form components to use fetch + `useFormStatus` (or similar) and then delete `apps/web/app/questions/actions.ts`. The route handlers at `app/api/questions/route.ts` and `app/api/questions/[questionId]/answers/route.ts` already cover both writes.

2. **`/ask` link consolidation.** Link targets in `top-command-bar.tsx`, `topic-rail.tsx`, `question-feed.tsx`, and `app/questions/page.tsx` were updated to `/ask`. A 1-line redirect stub at `app/questions/ask/page.tsx` covers any inbound bookmarks. The Frontend Agent can drop the redirect stub when comfortable.

3. **`apps/web/data/topics.data.ts` (critique Block §5).** The directory was not created. Per the critique: "if the Implementer creates the folder it must contain `topics.data.ts` … wired into `features/shell/components/topic-rail.tsx`. Otherwise, omit. Pick one." — wiring labels is feature work, so the Implementer **omitted** the folder. **Frontend Agent**: when topic-rail labels are reconciled (the image shows `CXC AI · Questions · Topics · Trending`; the current rail still shows `Questions · CXC AI · Ask Question`), create `apps/web/data/topics.data.ts` with the four canonical labels and re-add `"@/data/*"` to `apps/web/tsconfig.json`'s paths.

4. **Topic rail content vs. image (Open Q7).** As of now `topic-rail.tsx` and `top-command-bar.tsx` still show `Questions · CXC AI · Ask Question`. Image canon is `CXC AI · Questions · Topics · Trending` for the rail; the top-bar Ask button is correct. The Implementer left the existing labels in place since changing them is feature work and `Topics`/`Trending` map to surfaces that don't exist yet.

5. **`utils/format-date.ts`, `utils/text.ts`, `features/*/types/*.types.ts`, `features/*/hooks/*.ts`, `server/*/{*.queries,*.mutations,*.types}.ts` placeholders.** Not created in this phase to avoid empty single-file folders the brief explicitly discourages. Each of those files is authored by the Backend / Frontend agents when the first occupant lands. Barrels exist at the folder boundaries (`utils/index.ts`, `server/<feature>/index.ts`, `features/<feature>/index.ts`) and currently re-export `{}`.

6. **`packages/db/src/index.ts` is currently a barrel.** Each public symbol is re-exported from its split file. The web app's existing `import { … } from "@cardinalxchange/db"` paths therefore continue to work unchanged. If the Backend Agent prefers consumers to deep-import (e.g., `@cardinalxchange/db/src/questions.queries`), the package's `exports` field in `packages/db/package.json` must be widened first.

7. **`apps/web/features/cxc-ai/components/chat-shell.tsx` is one monolithic component.** The proposal anticipated a Backend/Frontend split into `chat-shell.tsx`, `message-list.tsx`, `message-composer.tsx`, `source-pill.tsx`, plus the `ask-community-draft-card.tsx` per panel-4 spec. The Implementer did the rename (`cxc-ai-chat.tsx` → `chat-shell.tsx`) but not the component split — that is feature work for the Frontend Agent.

8. **Image cross-check.** Confirmed that all four panels in the image map to routes in the resulting tree:
   - Panel 1 (Questions feed) → `app/questions/page.tsx`
   - Panel 2 (Ask form) → `app/ask/page.tsx` (canonical)
   - Panel 3 (Question detail + multiple answers) → `app/questions/[questionId]/page.tsx`
   - Panel 4 (CXC AI chat) → `app/cxc-ai/page.tsx` (new chat) + `app/cxc-ai/[chatId]/page.tsx` (resume)

9. **`packages/db/prisma/seed.mjs`** has been reduced to `process.exit(0)` per critique D7.

10. **Boundaries respected.** No file under `apps/web/features/**` imports `@cardinalxchange/db`, `@/server/cxc-ai/services/*`, or any other server-private path. `@/server/http/contracts` is the only `server` import surface available to features (currently used via the chat-shell's `UIMessage` type from `ai`, not from server contracts; Frontend Agent should switch to `@/server/http/contracts` once the chat shell is split). `packages/ui/src/**` continues to import only `class-variance-authority`, `clsx`, `tailwind-merge`, and `react`.
