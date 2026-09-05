export default function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white/70 px-5 py-4 shadow-card">
      <p className="text-sm text-ink-400">{label}</p>
      <p className={`mt-1.5 font-serif text-3xl ${accent || "text-ink-800"}`}>{value}</p>
    </div>
  );
}
