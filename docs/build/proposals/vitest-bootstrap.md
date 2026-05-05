# Vitest bootstrap

Replaces the previous `pnpm test` alias to `tsc --noEmit` with a real Vitest harness across every workspace.

## Dependencies installed

Versions are the latest stable as of install. `@testing-library/react` v17 was unreleased; v16 is the latest stable for React 19 support.

Root (`/package.json`):

- `vitest@^3.2.4`
- `@vitest/ui@^3.2.4`
- `@vitejs/plugin-react@^5.2.0`
- `jsdom@^26.1.0`

`apps/web/package.json`:

- `vitest@^3.2.4`
- `@vitejs/plugin-react@^5.2.0`
- `jsdom@^26.1.0`
- `@testing-library/react@^16.3.2`
- `@testing-library/dom@^10.4.1`
- `@testing-library/jest-dom@^6.9.1`

`packages/db/package.json`:

- `vitest@^3.2.4`

`packages/ui/package.json`:

- `vitest@^3.2.4`
- `@vitejs/plugin-react@^5.2.0`
- `jsdom@^26.1.0`

## Config files added

- `vitest.workspace.ts` (root) — aggregates the three per-workspace configs.
- `apps/web/vitest.config.ts` — `react()` plugin, `jsdom` env, `globals: true`, `setupFiles: ["./vitest.setup.ts"]`, alias resolution mirrored from `apps/web/tsconfig.json` (`@/app`, `@/backend`, `@/frontend`, `@/features`, `@/utils`, `@/data`, `@`).
- `apps/web/vitest.setup.ts` — `import "@testing-library/jest-dom/vitest"`.
- `packages/db/vitest.config.ts` — `node` env, includes `src/**/__tests__/**/*.test.ts`.
- `packages/ui/vitest.config.ts` — `react()` plugin, `jsdom` env, `globals: true` (no tests yet; runs with `--passWithNoTests`).

## Files modified

- `package.json` (root) — added `test:watch` script, dev deps for vitest/jsdom/plugin-react/@vitest/ui.
- `apps/web/package.json` — `test: "vitest run"`, added `test:watch: "vitest"`, removed the old `tsc --noEmit` alias.
- `packages/db/package.json` — same swap.
- `packages/ui/package.json` — `test: "vitest run --passWithNoTests"` plus `test:watch`.
- `turbo.json` — added a `test:watch` task (cache: false, persistent: true). The existing `test` task is unchanged.
- `CLAUDE.md` — added a "Testing" section.
- `STRUCTURE.md` — `Common Commands` reflects the real `pnpm test` and `pnpm test:watch`; the `tests/` row in the layout-mapping table now points at the `__tests__/` folders.

## Starter tests written

1. `packages/db/src/__tests__/questions.queries.test.ts` — 11 tests over `slugify` (basic case, unicode drop behavior, length cap at 72, empty input, leading/trailing hyphen trim, non-alphanumeric collapse) and `normalizeTagLabels` (slug computation, dedupe, empty-entry filtering, empty-slug filtering, empty input).
2. `apps/web/frontend/features/questions/components/__tests__/markdown.test.tsx` — 5 tests over the `<Markdown>` renderer: bold/italic/code tag emission, ordered list rendering, unordered list rendering, bare-URL anchor (target/rel), and `[text](url)` markdown links.
3. `apps/web/backend/http/__tests__/inputs.test.ts` — 6 tests over `parseCreateQuestionInput` and `parseCreateAnswerInput`: trimming, comma-separated tag normalization, empty-title rejection (HttpError 400 `invalid_question_input`), empty-body rejection, and the answer-input mirror cases.

Total: 22 passing tests across 3 test files.

## Verification

| Command | Result |
|---|---|
| `pnpm install` | clean |
| `pnpm test` | 4 tasks successful, 22 tests passing (db: 11, web: 11, ui: 0 with `--passWithNoTests`) |
| `pnpm typecheck` | green |
| `pnpm lint` | green |
| `pnpm build` | green (Next 16.2.4 build, all routes produced) |

## Out of scope (deliberately not done)

- No Postgres, OpenAI, or e2e harness — Vitest unit-only.
- No DB seeding, no fixtures, no auth tests.
- `packages/ui` has no tests yet; it runs with `--passWithNoTests` so the harness exits 0 until real component tests land.
