import { defineWorkspace } from "vitest/config";

/**
 * Aggregates per-workspace Vitest projects so the top-level `pnpm vitest`
 * (and `pnpm test` via Turbo) discovers tests across all workspaces.
 */
export default defineWorkspace([
  "apps/web/vitest.config.ts",
  "packages/db/vitest.config.ts",
  "packages/ui/vitest.config.ts",
]);
