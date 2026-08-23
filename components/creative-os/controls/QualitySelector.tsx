"use client";

import { QUALITY_OPTIONS } from "@/lib/creative-os/constants";
import type { Quality } from "@/lib/creative-os/types";

export function QualitySelector({
  value,
  onChange,
}: {
  value: Quality;
  onChange: (v: Quality) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="جودة التوليد">
      {QUALITY_OPTIONS.map((option) => {
        const active = option.id === value;
        const cell = 100 / option.gridDensity;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 " +
              (active
                ? "border-gold/40 bg-gold/[0.08]"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/20")
            }
          >
            <span
              className="block h-9 w-9 rounded-md"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                backgroundImage: `radial-gradient(circle, ${
                  active ? "rgba(217,165,92,0.75)" : "rgba(255,255,255,0.35)"
                } 0.6px, transparent 0.6px)`,
                backgroundSize: `${cell}% ${cell}%`,
              }}
            />
            <span className="text-right leading-tight">
              <span className={"block text-sm font-semibold " + (active ? "text-gold" : "text-fg")}>
                {option.id}
              </span>
              <span className="block text-[10px] text-fg-subtle">{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
