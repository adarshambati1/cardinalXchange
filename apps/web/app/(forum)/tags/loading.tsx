export default function TagsLoading() {
  return (
    <div className="w-full">
      <div className="pt-2">
        <div className="h-9 w-32 rounded-md bg-[var(--color-ink-100)]" />
        <div className="mt-3 h-3 w-2/3 rounded-md bg-[var(--color-ink-100)]" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            className="flex flex-col gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-base)] p-4"
            key={index}
          >
            <div className="h-5 w-20 rounded-md bg-[var(--color-ink-100)]" />
            <div className="h-3 w-16 rounded-md bg-[var(--color-ink-100)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
