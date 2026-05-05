# CI Pipeline

Source task: `docs/build/tasks/build-2/02-ci-pipeline.md`.

## Shipped

- `.github/workflows/ci.yml` — single `verify` job on `ubuntu-latest`.
  - Triggers: `push` on `main`, `pull_request` targeting `main`.
  - Concurrency group `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`.
  - Steps: `actions/checkout@v4` (`fetch-depth: 0`) → `pnpm/action-setup@v4` (pinned `10.33.2`, matches root `packageManager`) → `actions/setup-node@v4` (`node-version-file: .nvmrc`, `cache: pnpm`) → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm build`.
- `.nvmrc` — `22.13.1`. Now the canonical Node version for both local and CI.

## Not added (per task hard rules)

- No Postgres / service containers.
- No secrets (no `OPENAI_API_KEY`).
- No deploy steps.
- No changes to `package.json` scripts or new dependencies.

## Verification

Ran the exact CI command locally on `main`:

```
pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

All five steps green:

- `install` — lockfile up to date, no resolution work.
- `typecheck` — 4/4 workspaces pass (`config`, `db`, `ui`, `web`).
- `lint` — 4/4 workspaces, `eslint --max-warnings=0` clean.
- `test` — 22/22 Vitest tests pass across `db` (11) and `web` (11); `ui` and `config` have no test files (intentional, `--passWithNoTests`).
- `build` — Next.js 16.2.4 production build succeeds; all 16 routes compiled.

YAML well-formed (visually verified). `act` not installed; not adopted.

## Blockers

None.
