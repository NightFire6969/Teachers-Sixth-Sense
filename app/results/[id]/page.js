"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Briefing from "@/components/Briefing";
import MisconceptionCard from "@/components/MisconceptionCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const RISK_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const FILTERS = ["All", "High Risk", "Medium Risk", "Low Risk"];
const FILTER_TO_LEVEL = { "High Risk": "HIGH", "Medium Risk": "MEDIUM", "Low Risk": "LOW" };

export default function ResultsPage({ params }) {
  const [lesson, setLesson] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${params.id}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Could not load this analysis.");
        return;
      }
      setLesson(data.lesson);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const sortedMisconceptions = useMemo(() => {
    if (!lesson) return [];
    return [...lesson.misconceptions].sort((a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level]);
  }, [lesson]);

  const filtered = useMemo(() => {
    if (filter === "All") return sortedMisconceptions;
    const level = FILTER_TO_LEVEL[filter];
    return sortedMisconceptions.filter((m) => m.risk_level === level);
  }, [sortedMisconceptions, filter]);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container-page py-12">
        {status === "loading" && <LoadingState title="Loading analysis" />}
        {status === "error" && <ErrorState message={error} onRetry={load} />}

        {status === "ready" && lesson && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-300">
                  {lesson.subject} &middot; {lesson.grade}
                </p>
                <h1 className="mt-1 font-serif text-3xl text-ink-800">{lesson.topic}</h1>
              </div>
              <Link
                href="/analyze"
                className="rounded-sm bg-ink-800 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-700"
              >
                Analyze Another Lesson
              </Link>
            </div>

            {lesson.material_truncated && (
              <p className="mt-3 text-xs text-signal-medium">
                The lesson material you submitted was long, so it was shortened before analysis.
              </p>
            )}

            {lesson.briefing && (
              <div className="mt-8">
                <Briefing
                  briefing={lesson.briefing}
                  lessonId={lesson.id}
                  lessonContext={{ subject: lesson.subject, grade: lesson.grade, topic: lesson.topic }}
                  misconceptions={lesson.misconceptions}
                />
              </div>
            )}

            <p className="mt-6 line-length text-sm text-ink-400">
              These are AI-generated predictions intended to support teacher judgment, not replace it.
            </p>

            <section className="mt-10">
              <h2 className="font-serif text-xl text-ink-800">Misconception Radar</h2>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <RadarStat label="Total" value={lesson.misconceptions.length} />
                <RadarStat label="High risk" value={lesson.high_count} className="text-signal-high" />
                <RadarStat label="Medium risk" value={lesson.medium_count} className="text-signal-medium" />
                <RadarStat label="Low risk" value={lesson.low_count} className="text-signal-low" />
              </div>

              {lesson.misconceptions.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="Limited analysis"
                    description={
                      lesson.limited_reason ||
                      "The lesson material provided was too short or too vague to identify meaningful misconceptions. Add more detail and try again."
                    }
                  />
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
                          filter === f
                            ? "border-ink-800 bg-ink-800 text-paper"
                            : "border-ink-200 text-ink-500 hover:border-ink-800 hover:text-ink-800"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4">
                    {filtered.map((m, i) => (
                      <MisconceptionCard
                        key={i}
                        misconception={m}
                        lessonContext={{
                          subject: lesson.subject,
                          grade: lesson.grade,
                          topic: lesson.topic,
                          material: lesson.material,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function RadarStat({ label, value, className }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white/70 px-4 py-3 shadow-card">
      <p className="text-xs text-ink-400">{label}</p>
      <p className={`mt-1 font-serif text-2xl text-ink-800 ${className || ""}`}>{value}</p>
    </div>
  );
}
