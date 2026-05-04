export default function CxcAiLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-6 sm:px-8">
      <div className="border-b border-[var(--color-border-default)] pb-4">
        <div className="h-8 w-32 bg-[var(--color-ink-100)]" />
        <div className="mt-3 h-3 w-2/3 bg-[var(--color-ink-100)]" />
      </div>
      <div className="mt-4 h-96 border border-[var(--color-border-default)] bg-[var(--color-surface-sunk)]" />
      <div className="mt-4 h-32 border border-[var(--color-border-default)] bg-[var(--color-surface-base)]" />
    </div>
  );
}
