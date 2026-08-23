import { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "raised";
}

/** Base frosted-glass surface used across the Creative OS visuals. */
export function GlassPanel({ className, tone = "default", ...props }: GlassPanelProps) {
  return (
    <div
      className={cx(
        "relative rounded-2xl border backdrop-blur-xl",
        tone === "raised"
          ? "border-white/10 bg-white/[0.05] shadow-panel"
          : "border-white/[0.07] bg-white/[0.025]",
        className
      )}
      {...props}
    />
  );
}
