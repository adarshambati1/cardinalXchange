# Derived Types Audit (A2)

## Summary

Walked every `*.types.ts`, `contracts.ts`, mapper signature, and frontend prop type that crossed the DB/wire/UI boundary. Result: **4 wire DTOs + 1 frontend prop shape converted to derivations**, plus a new shared `Serialized<T>` primitive in `apps/web/backend/http/contracts.ts`.

| #   | Location                                                        | Before                                                    | After                                                                   |
| --- | --------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | `apps/web/backend/http/contracts.ts`                            | —                                                         | new `Serialized<T>` (Date → string, recursive)                          |
| 2   | `apps/web/backend/http/contracts.ts`                            | hand-typed `TagListItemDto` (3 fields)                    | `TagListItemDto = TagWithCountRecord`                                   |
| 3   | `apps/web/backend/http/contracts.ts`                            | hand-typed `AiChatSession` (5 fields)                     | `Serialized<Pick<AiChatSessionRecord, ...>>`                            |
| 4   | `apps/web/backend/users/users.service.ts`                       | hand-typed `UserProfileDto` w/ nested arrays (~22 fields) | `Serialized<Pick<UserProfileRecord, ...> & UserActivityRecord & {...}>` |
| 5   | `apps/web/frontend/features/cxc-ai/components/message-list.tsx` | three inline `{ title; body; tags: string[] }`            | `AskCommunityDraft` from `@/backend/http/contracts`                     |

Verification after every chunk: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green. Test count stayed at 114 (17 db + 97 web).

## The new primitive

```ts
// apps/web/backend/http/contracts.ts
export type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
    ? Array<Serialized<U>>
    : T extends object
      ? { [K in keyof T]: Serialized<T[K]> }
      : T;
```

Reusable across every wire DTO. The boundary in this codebase is "Prisma `Date` becomes ISO string in JSON"; once that's a single transform, DTOs read as `Serialized<RecordShape & extras>`.

## Representative before/after — by layer

### DB → backend → wire (the strongest case)

`UserProfileDto` re-listed every column on `UserProfileRecord` and `UserActivityRecord` from scratch.

**Before** (≈26 lines of fields):

```ts
export type UserProfileDto = {
  id: string;
  name: string;
  displayName: string;
  email: string;
  image: string | null;
  joinedAt: string;
  questionCount: number;
  answerCount: number;
  questions: Array<{
    id: string;
    slug: string;
    title: string;
    createdAt: string;
    answerCount: number;
  }>;
  answers: Array<{
    id: string;
    questionId: string;
    questionSlug: string;
    questionTitle: string;
    body: string;
    createdAt: string;
  }>;
};
```

**After** (≈9 lines, schema-tracked):

```ts
export type UserProfileDto = Serialized<
  Pick<
    UserProfileRecord,
    "id" | "name" | "email" | "image" | "questionCount" | "answerCount"
  > &
    UserActivityRecord & {
      displayName: string; // record column is nullable; service supplies fallback
      joinedAt: Date; // renamed from record's `createdAt`
    }
>;
```

A new column on `UserProfileRecord` or `UserActivityRecord` now flows through to the wire DTO with no edits here.

### Backend → wire (small but pure)

```diff
- export type TagListItemDto = {
-   slug: string;
-   label: string;
-   questionCount: number;
- };
+ export type TagListItemDto = TagWithCountRecord;
```

Plus the inline mapper in `tags.service.ts` collapses to `return listTagsWithCounts();` — the row shape was already correct.

### Frontend props (DTO consolidation)

`message-list.tsx` had three independent inline copies of the ask-community draft shape:

```diff
- function AskCommunityDraftCard({
-   draft,
- }: { draft: { title: string; body: string; tags: string[] } }) { ... }
+ function AskCommunityDraftCard({ draft }: { draft: AskCommunityDraft }) { ... }

- function extractDrafts(message: CxcMessageDto):
-   { title: string; body: string; tags: string[] }[] { ... }
+ function extractDrafts(message: CxcMessageDto): AskCommunityDraft[] { ... }
```

`AskCommunityDraft` already existed in `contracts.ts` and travels through the AI tool output. The frontend now uses the same shared name everywhere.

## Mapper signatures — already derivation-shaped

A walk through `apps/web/backend/**/*.{service,mappers}.ts` confirmed the existing mapper signatures already accept Prisma payloads:

- `toSummaryDto(question: SummarizableQuestion)` where `SummarizableQuestion = QuestionRecord | QuestionFeedRecord`
- `toAnswerDto(answer: QuestionRecord["answers"][number])`
- `toTagDto(questionTag: SummarizableQuestion["tags"][number])`
- `toMessageDto(message: AiChatSessionRecord["messages"][number])`
- `toSessionDto(record: AiChatSessionRecord)`
- `toUserProfileDto(profile: UserProfileRecord, activity: UserActivityRecord)`

No mapper was rewritten. The signatures were already in the right shape — the audit's job here was to verify, not to refactor.

## Intentionally left hand-typed

Three wire DTOs stay hand-typed because the wire shape is **deliberately divergent** from the DB shape — derivation would obscure intent rather than track it.

- **`QuestionSummaryDto`** — every interesting field is a transform, not a column: `excerpt` is body-truncated, `askedAt` is relative time, `activity` is templated copy ("new answer 5m ago"), `status` re-maps `OPEN | ANSWERED | ACCEPTED` to a 2-value wire union, `author` renames `authorName`. A `Pick` would only cover `id`, `slug`, `title`, leaving the bulk of the type still hand-typed.
- **`AnswerDto`** — same pattern: `author` renames `authorName`, `authorMeta` is non-null fallback, `body` and `id` are direct but small.
- **`AiChatSource`** — server-shaped from the retrieval pipeline, not from any single Prisma row. `kind` is a 3-value wire union spanning two record sources (`AiChatSourceKind` enum + a `web` synthetic kind), `label`/`url` are computed.
- **`AskCommunityDraft`** — pure user-facing draft shape, no DB row to derive from (drafts live only in chat tool output).
- **`CreateQuestionInput` / `CreateAnswerInput`** — input shapes with `authorDisplayName?` and `authorMeta?` overrides that explicitly do **not** match `CreateQuestionRecordInput` (which expects resolved `authorName`/`authorId`). The route handler calls `getViewer()` between the two; deriving would lose that seam.

## Boundaries respected

- Did not touch `packages/ui/**`, `apps/web/app/globals.css`, or the Prisma schema.
- Did not modify tests; they continued to pass against the new derived types.
- Coordinated with the parallel A1 audit on `apps/web/backend/users/users.service.ts`: A1 had already done a partial `Pick` derivation; A2 collapsed it further with `Serialized<T>` (per the cross-layer ownership rule).
