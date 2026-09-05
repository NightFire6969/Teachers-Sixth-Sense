import Link from "next/link";

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9.5" stroke="#3E7DA6" strokeWidth="1.3" />
      <circle cx="11" cy="11" r="5.5" stroke="#3E7DA6" strokeWidth="1.1" opacity="0.6" />
      <circle cx="11" cy="11" r="1.6" fill="#B8402F" />
    </svg>
  );
}

export default function Nav({ active }) {
  const linkClass = (key) =>
    `text-sm transition-colors ${
      active === key ? "text-ink-800 font-medium" : "text-ink-400 hover:text-ink-700"
    }`;

  return (
    <header className="border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-serif text-[1.05rem] leading-none text-ink-800">
            Teacher&rsquo;s Sixth Sense
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className={linkClass("dashboard")}>
            Dashboard
          </Link>
          <Link
            href="/analyze"
            className={`rounded-sm px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === "analyze"
                ? "bg-ink-800 text-paper"
                : "bg-ink-800 text-paper hover:bg-ink-700"
            }`}
          >
            Analyze a Lesson
          </Link>
        </nav>
      </div>
    </header>
  );
}
