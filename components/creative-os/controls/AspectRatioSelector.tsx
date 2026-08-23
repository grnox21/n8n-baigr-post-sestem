"use client";

import { ASPECT_RATIO_OPTIONS } from "@/lib/creative-os/constants";
import type { AspectRatio } from "@/lib/creative-os/types";

export function AspectRatioSelector({
  value,
  onChange,
}: {
  value: AspectRatio;
  onChange: (v: AspectRatio) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="نسبة القياس">
      {ASPECT_RATIO_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={
              "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 " +
              (active
                ? "border-gold/40 bg-gold/[0.08]"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/20")
            }
          >
            <span
              className={
                "block border " + (active ? "border-gold/70 bg-gold/10" : "border-white/25")
              }
              style={{
                aspectRatio: option.css,
                height: 18,
                width: `${18 * (Number(option.id.split(":")[0]) / Number(option.id.split(":")[1]))}px`,
              }}
            />
            <span className="text-right leading-tight">
              <span className={"block text-xs font-semibold " + (active ? "text-gold" : "text-fg")}>
                {option.id}
              </span>
              <span className="block text-[10px] text-fg-subtle">{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
