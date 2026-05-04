import Link from "next/link";

const navItems = [
  { label: "Questions", href: "/questions" },
  { label: "CXC AI", href: "/cxc-ai" },
  { label: "Ask Question", href: "/ask" },
];

export function TopCommandBar() {
  return (
    <header className="border-graphite-200 bg-paper/95 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
        <Link
          className="focus-visible:ring-cardinal-600 flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
          href="/questions"
        >
          <span className="bg-cardinal-700 grid h-8 w-8 shrink-0 place-items-center rounded-md text-sm font-black text-white shadow-sm">
            CX
          </span>
          <span className="text-graphite-950 hidden text-base font-black tracking-normal md:block">
            CardinalXchange
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex min-w-full items-center gap-1 overflow-x-auto sm:min-w-0 sm:flex-1 sm:justify-end"
        >
          {navItems.map((item) => (
            <Link
              className="text-graphite-700 hover:text-cardinal-800 focus-visible:ring-cardinal-600 h-9 shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-white focus-visible:ring-2 focus-visible:outline-none"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
