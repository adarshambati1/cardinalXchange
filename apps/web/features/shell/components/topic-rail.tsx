import Link from "next/link";
import { cn } from "@cardinalxchange/ui";

const forumNav = [
  { label: "Questions", href: "/questions" },
  { label: "CXC AI", href: "/cxc-ai" },
  { label: "Ask Question", href: "/ask" },
];

export function TopicRail({ compact = false }: { compact?: boolean }) {
  const className = compact
    ? "flex gap-2 overflow-x-auto border-b border-graphite-200 bg-paper px-4 py-3 lg:hidden"
    : "hidden space-y-1 lg:block";

  return (
    <nav aria-label="Question navigation" className={className}>
      {forumNav.map((item, index) => (
        <Link
          className={cn(
            compact
              ? "focus-visible:ring-cardinal-600 inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              : "focus-visible:ring-cardinal-600 flex h-10 items-center rounded-md px-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none",
            index === 0
              ? "bg-cardinal-50 text-cardinal-900"
              : "text-graphite-700 hover:bg-graphite-100 hover:text-graphite-950",
          )}
          href={item.href}
          key={item.label}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
