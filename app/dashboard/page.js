"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import SummaryCard from "@/components/SummaryCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { SUBJECTS } from "@/lib/validation";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const [lessons, setLessons] = useState(null);
  const [mock, setMock] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("newest");

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const params = new URLSearchParams({ search, subject, sort });
      const res = await fetch(`/api/lessons?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Could not load lesson history.");
        return;
      }
      setLessons(data.lessons);
      setMock(data.mock);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, subject, sort]);

  const totals = useMemo(() => {
    if (!lessons) return { total: 0, high: 0, medium: 0 };
    return lessons.reduce(
      (acc, l) => ({
        total: acc.total + 1,
        high: acc.high + (l.high_count || 0),
        medium: acc.medium + (l.medium_count || 0),
      }),
      { total: 0, high: 0, medium: 0 }
    );
  }, [lessons]);

  return (
    <div className="min-h-screen">
      <Nav active="dashboard" />

      <main className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-ink-800">Dashboard</h1>
            <p className="mt-1 text-sm text-ink-500">
              {mock
                ? "Showing sample data — connect Supabase to persist real analyses."
                : "Your analyzed lessons, most recent first."}
            </p>
          </div>
          <Link
            href="/analyze"
            className="rounded-sm bg-ink-800 px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-700"
          >
            + Analyze New Lesson
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <SummaryCard label="Total Lessons Analyzed" value={totals.total} />
          <SummaryCard label="High-Risk Misconceptions" value={totals.high} accent="text-signal-high" />
          <SummaryCard label="Medium-Risk Misconceptions" value={totals.medium} accent="text-signal-medium" />
          <SummaryCard label="Recent Analyses" value={lessons?.length ?? 0} />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search by topic or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="mt-6">
          {status === "loading" && <LoadingState title="Loading lesson history" />}
          {status === "error" && <ErrorState message={error} onRetry={load} />}

          {status === "ready" && lessons.length === 0 && (
            <EmptyState
              title="No analyses yet"
              description="Analyze your first lesson to start building a history of potential misconceptions."
              action={
                <Link href="/analyze" className="rounded-sm bg-ink-800 px-4 py-2 text-sm font-medium text-paper">
                  Analyze a Lesson
                </Link>
              }
            />
          )}

          {status === "ready" && lessons.length > 0 && (
            <ul className="divide-y divide-ink-100 rounded-md border border-ink-100 bg-white/60">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/results/${lesson.id}`}
                    className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-paper-dim/60 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-6"
                  >
                    <div>
                      <p className="font-medium text-ink-800">{lesson.topic}</p>
                      <p className="text-xs text-ink-400">
                        {lesson.subject} &middot; {lesson.grade}
                      </p>
                    </div>
                    <span className="text-xs text-ink-400">{formatDate(lesson.created_at)}</span>
                    <span className="text-xs font-medium text-signal-high">{lesson.high_count} High</span>
                    <span className="text-xs font-medium text-signal-medium">{lesson.medium_count} Medium</span>
                    <span className="text-xs font-medium text-signal-low">{lesson.low_count} Low</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
