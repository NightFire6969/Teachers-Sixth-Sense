export default function LoadingState({ title = "Scanning lesson material", subtitle }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 rounded-md border border-ink-100 bg-white/60 px-6 py-16 text-center"
    >
      <div className="relative h-1 w-48 overflow-hidden rounded-full bg-ink-100">
        <div className="absolute inset-y-0 w-1/3 rounded-full bg-scan animate-sweep" />
      </div>
      <div>
        <p className="font-serif text-lg text-ink-800">{title}</p>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
    </div>
  );
}
