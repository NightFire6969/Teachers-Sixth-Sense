export default function ErrorState({ message, onRetry, retryLabel = "Retry Analysis" }) {
  return (
    <div className="rounded-md border border-signal-high/30 bg-signal-high-soft/60 px-6 py-8 text-center">
      <p className="font-medium text-signal-high">{message || "Something went wrong."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-sm border border-signal-high/40 px-4 py-2 text-sm font-medium text-signal-high transition-colors hover:bg-signal-high hover:text-white"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
