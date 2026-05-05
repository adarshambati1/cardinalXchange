# Taste Calls — Decisions Log

Decisions on the four taste calls deferred during the autoplan reviews.
Each one auto-decided via the autoplan principles: completeness, boil
the lake, pragmatic, DRY, explicit over clever, bias toward action.

## T1 — Drop unused `/api/cxc-ai/chats/[chatId]/messages` route?

**Status:** DROPPED.

**Why:** Wave-5's server-side persistence (`streamCxcAiTurn` →
`onFinish` → `replaceAiChatMessages`) made this route unnecessary.
Grep confirmed no application code calls it — only build-artifact
references in `.next/types`. Per **explicit over clever**: less
unused surface area is less to maintain.

**Recovery if needed later:** the persistence write helper in
`apps/web/backend/cxc-ai/services/chat.service.ts` is reusable from
any new route handler if a manual override hatch becomes useful.

## T2 — Move `searchInternalContext` from `packages/db` to `apps/web/backend/cxc-ai`?

**Status:** KEPT IN `packages/db`.

**Why:** The convention is "`packages/db` owns Prisma access".
`searchInternalContext` is a Prisma query against public Question /
Answer rows — it belongs in the data-access layer regardless of who
consumes it today. Moving it adds a translation step without a
clear benefit. Per **pragmatic** and **DRY**: don't move things
just because there's only one consumer right now.

## T3 — `force-dynamic` on `app/cxc-ai/page.tsx` vs layout?

**Status:** KEPT ON PAGE.

**Why:** Page-level placement is more explicit about which exact
route opts out of static optimization. Lifting to the layout would
implicitly opt out every nested route — including
`/cxc-ai/[chatId]` which has its own dynamic-segment handling.
Per **explicit over clever**: keep the directive next to the route
that actually needs it.

## T4 — Wrap AI SDK `UIMessage` types in our own strict DTOs?

**Status:** KEPT LOOSE at boundary.

**Why:** The AI SDK's `UIMessage<TMetadata, TDataParts, TTools>`
generic types are already typed at the parts the app uses. Wrapping
them in CardinalXchange-owned DTOs would add a translation layer
between the SDK and our React components without surfacing extra
type safety we'd actually catch in code review. Per **pragmatic**:
the marginal gain doesn't justify the maintenance cost. We continue
to import `UIMessage` directly in `apps/web/backend/http/contracts.ts`.

**Revisit if:** the AI SDK ships breaking changes between minor
versions, or if our message-list rendering diverges far enough from
the SDK's parts model that mapping at boundary becomes load-bearing.
