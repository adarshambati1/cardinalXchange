import type { CxcSourceDto } from "@/server/http/contracts";

/**
 * Square 1px-bordered label rendered alongside an assistant message. Clicking
 * a `question`/`answer` source opens the canonical `/questions/[id]` page in
 * a new tab; web sources open their external URL.
 */
export function SourcePill({ source }: { source: CxcSourceDto }) {
  const label = source.label ?? labelForKind(source.kind);
  const target = source.url || "#";

  return (
    <a
      className="inline-flex max-w-full items-center gap-1 truncate border border-[var(--color-border-default)] bg-[var(--color-surface-sunk)] px-2 py-0.5 text-xs font-medium leading-none text-[var(--color-ink-700)] transition-colors duration-150 ease-out hover:border-[var(--color-cardinal-500)] hover:text-[var(--color-cardinal-500)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
      href={target}
      rel="noreferrer"
      target="_blank"
      title={source.title}
    >
      <span className="font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
        {label}
      </span>
      <span aria-hidden>·</span>
      <span className="truncate">{source.title}</span>
    </a>
  );
}

function labelForKind(kind: CxcSourceDto["kind"]): string {
  if (kind === "question") return "Q";
  if (kind === "answer") return "A";
  return "Web";
}

export default SourcePill;
