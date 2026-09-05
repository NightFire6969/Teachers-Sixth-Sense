"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import WorkflowSteps from "@/components/WorkflowSteps";
import FileUpload from "@/components/FileUpload";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { SUBJECTS, MAX_MATERIAL_CHARS } from "@/lib/validation";

const initialForm = { subject: "", grade: "", topic: "", material: "" };

export default function AnalyzePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [phase, setPhase] = useState("idle"); // idle | scanning | error
  const [error, setError] = useState(null);
  const [uploadWarning, setUploadWarning] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errors = {};
    if (!form.subject.trim()) errors.subject = "Choose a subject.";
    if (!form.grade.trim()) errors.grade = "Enter a grade or class.";
    if (!form.topic.trim()) errors.topic = "Enter the lesson topic.";
    if (!form.material.trim()) errors.material = "Paste or upload lesson material before scanning.";
    else if (form.material.trim().length < 20) {
      errors.material = "Lesson material is very short — add a bit more so the analysis is meaningful.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleScan() {
    if (!validate()) return;

    setPhase("scanning");
    setError(null);

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const analysis = await analyzeRes.json();

      if (!analyzeRes.ok) {
        setPhase("error");
        setError(analysis.error || "Something went wrong while analyzing this lesson.");
        if (analysis.fieldErrors) setFieldErrors(analysis.fieldErrors);
        return;
      }

      let briefing = null;
      if (analysis.misconceptions.length > 0) {
        try {
          const briefingRes = await fetch("/api/briefing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, misconceptions: analysis.misconceptions }),
          });
          const briefingData = await briefingRes.json();
          if (briefingRes.ok) briefing = briefingData.briefing;
        } catch {
          // Briefing is a bonus on top of the analysis — don't fail the whole flow.
        }
      }

      const saveRes = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          misconceptions: analysis.misconceptions,
          limited_analysis: !analysis.sufficient_material,
          limited_reason: analysis.limited_reason,
          material_truncated: analysis.material_truncated,
          briefing,
        }),
      });
      const saved = await saveRes.json();

      if (!saveRes.ok) {
        setPhase("error");
        setError(saved.error || "The analysis finished, but it couldn't be saved.");
        return;
      }

      router.push(`/results/${saved.lesson.id}`);
    } catch {
      setPhase("error");
      setError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  const remaining = MAX_MATERIAL_CHARS - form.material.length;

  return (
    <div className="min-h-screen">
      <Nav active="analyze" />

      <main className="container-page py-12">
        <WorkflowSteps current="Add Lesson" />

        <h1 className="mt-8 font-serif text-3xl text-ink-800">Analyze a lesson</h1>
        <p className="mt-2 line-length text-sm text-ink-500">
          Tell us about the lesson and paste or upload the material you plan to teach.
          Nothing is sent for analysis until you scan.
        </p>

        {phase === "scanning" && (
          <div className="mt-8">
            <LoadingState
              title="Scanning lesson material"
              subtitle="Looking for conceptual misconceptions before they happen…"
            />
          </div>
        )}

        {phase === "error" && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={handleScan} />
          </div>
        )}

        {phase !== "scanning" && (
          <form
            className="mt-8 grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
          >
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-ink-700" htmlFor="subject">
                  Subject
                </label>
                <select
                  id="subject"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  className={`mt-1.5 w-full rounded-sm border bg-white px-3 py-2 text-sm text-ink-800 ${
                    fieldErrors.subject ? "border-signal-high" : "border-ink-200"
                  }`}
                >
                  <option value="">Select a subject&hellip;</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {fieldErrors.subject && <p className="mt-1 text-xs text-signal-high">{fieldErrors.subject}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700" htmlFor="grade">
                  Grade / Class
                </label>
                <input
                  id="grade"
                  type="text"
                  placeholder="e.g. 7th Grade, Period 3"
                  value={form.grade}
                  onChange={(e) => update("grade", e.target.value)}
                  className={`mt-1.5 w-full rounded-sm border bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 ${
                    fieldErrors.grade ? "border-signal-high" : "border-ink-200"
                  }`}
                />
                {fieldErrors.grade && <p className="mt-1 text-xs text-signal-high">{fieldErrors.grade}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700" htmlFor="topic">
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  placeholder="e.g. Dividing fractions"
                  value={form.topic}
                  onChange={(e) => update("topic", e.target.value)}
                  className={`mt-1.5 w-full rounded-sm border bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 ${
                    fieldErrors.topic ? "border-signal-high" : "border-ink-200"
                  }`}
                />
                {fieldErrors.topic && <p className="mt-1 text-xs text-signal-high">{fieldErrors.topic}</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink-700">Upload lesson material (optional)</p>
              <div className="mt-1.5">
                <FileUpload
                  onExtracted={(text, warning) => {
                    update("material", text);
                    setUploadWarning(warning || null);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium text-ink-700" htmlFor="material">
                  Lesson material
                </label>
                <span className="text-xs text-ink-300">
                  {form.material.length.toLocaleString()} / {MAX_MATERIAL_CHARS.toLocaleString()} characters
                </span>
              </div>
              <textarea
                id="material"
                rows={12}
                placeholder="Paste lesson notes, textbook content, a lesson plan, or an explanation here…"
                value={form.material}
                onChange={(e) => update("material", e.target.value)}
                className={`mt-1.5 w-full rounded-sm border bg-white px-3 py-2.5 text-sm leading-relaxed text-ink-800 placeholder:text-ink-300 ${
                  fieldErrors.material ? "border-signal-high" : "border-ink-200"
                }`}
              />
              {fieldErrors.material && <p className="mt-1 text-xs text-signal-high">{fieldErrors.material}</p>}
              {uploadWarning && <p className="mt-1 text-xs text-signal-medium">{uploadWarning}</p>}
              {remaining < 0 && (
                <p className="mt-1 text-xs text-signal-high">
                  This material is too long by {Math.abs(remaining).toLocaleString()} characters. Shorten it before
                  scanning.
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="rounded-sm bg-ink-800 px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-700 disabled:opacity-50"
                disabled={remaining < 0}
              >
                Scan for Misconceptions
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
