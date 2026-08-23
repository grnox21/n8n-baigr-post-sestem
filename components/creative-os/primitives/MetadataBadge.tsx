interface MetadataBadgeProps {
  label: string;
  value: string;
  accent?: boolean;
}

/** Small technical label/value pair — model, format, quality, status readouts. */
export function MetadataBadge({ label, value, accent }: MetadataBadgeProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </span>
      <span
        className={
          "font-mono text-xs font-medium " + (accent ? "text-gold" : "text-fg-muted")
        }
      >
        {value}
      </span>
    </div>
  );
}
