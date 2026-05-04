import type { ReactNode } from "react";

import { TopCommandBar } from "@/features/shell/components/top-command-bar";
import { TopicRail } from "@/features/shell/components/topic-rail";

/**
 * Composes the cardinal-red top bar, the four-item left rail, and a
 * `<main>` slot. Used by every product route.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-base)] text-[var(--color-ink-900)]">
      <TopCommandBar />
      <div className="flex flex-1 min-h-0">
        <TopicRail />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default PageShell;
