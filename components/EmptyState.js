export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-md border border-dashed border-ink-200 px-6 py-14 text-center">
      <p className="font-serif text-lg text-ink-700">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
