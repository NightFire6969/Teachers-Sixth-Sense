const STYLES = {
  HIGH: { swatch: "bg-signal-high", text: "text-signal-high", label: "High risk" },
  MEDIUM: { swatch: "bg-signal-medium", text: "text-signal-medium", label: "Medium risk" },
  LOW: { swatch: "bg-signal-low", text: "text-signal-low", label: "Low risk" },
};

export default function RiskBadge({ level, size = "md" }) {
  const style = STYLES[level] || STYLES.LOW;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 ${textSize} font-medium ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.swatch}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}
