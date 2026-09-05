"use client";

import { useState } from "react";

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-paper/50">{title}</p>
      <div className="mt-1.5 text-sm text-paper/90">{children}</div>
    </div>
  );
}

export default function Briefing({ briefing, lessonContext, misconceptions, lessonId, onRegenerated }) {
  const [current, setCurrent] = useState(briefing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function regenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lessonContext, misconceptions, lessonId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't regenerate the briefing.");
        return;
      }
      setCurrent(data.briefing);
      onRegenerated?.(data.briefing);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!current) return null;

  return (
    <div className="rounded-md border border-ink-800 bg-ink-800 p-6 text-paper">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-xl">60-Second Teacher Briefing</h2>
        <button
          onClick={regenerate}
          disabled={loading}
          className="whitespace-nowrap rounded-sm border border-paper/30 px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-paper hover:text-ink-800 disabled:opacity-50"
        >
          {loading ? "Regenerating…" : "Regenerate Briefing"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-signal-high-soft">{error}</p>}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Section title="Before the lesson">
          <ul className="list-disc space-y-1 pl-4">
            {current.before_the_lesson.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="During the lesson">
          <ul className="list-disc space-y-1 pl-4">
            {current.during_the_lesson.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title="If students get confused">
          <p>{current.if_students_get_confused}</p>
        </Section>
        <Section title="Quick check">
          <ul className="list-disc space-y-1 pl-4">
            {current.quick_check.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
