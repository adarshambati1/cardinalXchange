import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const here = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the path aliases declared in apps/web/tsconfig.json so tests
    // resolve internal modules the same way the Next.js build does.
    alias: {
      "@/app": here("./app"),
      "@/backend": here("./backend"),
      "@/frontend": here("./frontend"),
      "@/features": here("./frontend/features"),
      "@/utils": here("./shared/utils"),
      "@/data": here("./shared/data"),
      "@": here("./"),
    },
  },
  test: {
    name: "web",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
  },
});
