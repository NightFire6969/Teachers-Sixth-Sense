"use client";

import { useState } from "react";
import RiskBadge from "./RiskBadge";

const BORDER_BY_RISK = {
  HIGH: "border-l-signal-high",
  MEDIUM: "border-l-signal-medium",
  LOW: "border-l-signal-low",
};

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-300">{label}</p>
      <p className="mt-1 text-sm text-ink-700">{children}</p>
    </div>
  );
}

function PanelButton({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-ink-800 bg-ink-800 text-paper"
          : "border-ink-200 text-ink-500 hover:border-ink-800 hover:text-ink-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function MisconceptionCard({ misconception, lessonContext }) {
  const [openPanel, setOpenPanel] = useState(null); // null | "challenge" | "alternative"
  const [challenge, setChallenge] = useState(null);
  const [alternative, setAlternative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [panelError, setPanelError] = useState(null);

  async function togglePanel(kind) {
    if (openPanel === kind) {
      setOpenPanel(null);
      return;
    }
    setOpenPanel(kind);
    setPanelError(null);

    const already = kind === "challenge" ? challenge : alternative;
    if (already) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lessonContext, misconception }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPanelError(data.error || "Something went wrong.");
      } else if (kind === "challenge") {
        setChallenge(data);
      } else {
        setAlternative(data);
      }
    } catch {
      setPanelError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-md border border-ink-100 border-l-[3px] bg-white/70 p-5 shadow-card ${BORDER_BY_RISK[misconception.risk_level] || ""}`}>
      <div className="flex items-start justify-between gap-4">
        <RiskBadge level={misconception.risk_level} />
      </div>

      <p className="mt-3 font-serif text-lg leading-snug text-ink-800">{misconception.misconception}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Why students might think this">{misconception.explanation}</Field>
        <Field label="What to watch for">{misconception.what_to_watch_for}</Field>
        <Field label="Suggested intervention">{misconception.suggested_intervention}</Field>
        <Field label="Suggested question">{misconception.suggested_question}</Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
        <PanelButton onClick={() => togglePanel("challenge")} active={openPanel === "challenge"}>
          Challenge This Prediction
        </PanelButton>
        <PanelButton onClick={() => togglePanel("alternative")} active={openPanel === "alternative"}>
          Show Alternative Interpretation
        </PanelButton>
      </div>

      {openPanel && (
        <div className="mt-4 rounded-md border border-ink-100 bg-paper-dim/60 p-4">
          {loading && <p className="text-sm text-ink-400">Thinking this through&hellip;</p>}
          {!loading && panelError && (
            <div className="text-sm text-signal-high">
              {panelError}{" "}
              <button
                onClick={() => togglePanel(openPanel)}
                className="ml-1 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !panelError && openPanel === "challenge" && challenge && (
            <div className="space-y-3">
              <Field label="Evidence found in the lesson">{challenge.evidence_from_lesson}</Field>
              <Field label="General educational reasoning">{challenge.general_reasoning}</Field>
              <Field label="Uncertainty">{challenge.uncertainty}</Field>
            </div>
          )}

          {!loading && !panelError && openPanel === "alternative" && alternative && (
            <div className="space-y-3">
              {alternative.has_alternative ? (
                <>
                  <Field label="Alternative interpretation">{alternative.alternative_misconception}</Field>
                  <Field label="Reasoning">{alternative.reasoning}</Field>
                </>
              ) : (
                <p className="text-sm text-ink-600">
                  No reasonable alternative interpretation stands out for this misconception.
                </p>
              )}
              <Field label="Uncertainty">{alternative.uncertainty_note}</Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
