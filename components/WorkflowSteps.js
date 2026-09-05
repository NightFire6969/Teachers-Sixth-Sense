const STEPS = ["Add Lesson", "Scan", "Discover Misconceptions", "Prepare"];

export default function WorkflowSteps({ current }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEPS.map((step, i) => {
        const isCurrent = current === step;
        return (
          <li key={step} className="flex items-center">
            <span
              className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm ${
                isCurrent
                  ? "border-ink-800 bg-ink-800 text-paper"
                  : "border-ink-200 text-ink-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-scan" : "bg-ink-200"}`}
                aria-hidden="true"
              />
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-2 text-ink-200" aria-hidden="true">
                &rarr;
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
