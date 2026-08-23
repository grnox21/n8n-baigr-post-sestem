"use client";

import { motion } from "framer-motion";
import { MODEL_OPTIONS } from "@/lib/creative-os/constants";
import type { ModelChoice } from "@/lib/creative-os/types";

export function ModelSelector({
  value,
  onChange,
}: {
  value: ModelChoice;
  onChange: (v: ModelChoice) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="نموذج الذكاء الاصطناعي">
      {MODEL_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={
              "group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-xl border px-3.5 py-3 text-right transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 " +
              (active
                ? "border-gold/40 bg-gold/[0.07]"
                : "border-white/[0.08] bg-white/[0.02] opacity-60 hover:opacity-90")
            }
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span
                className={
                  "absolute inset-0 rounded-full border " +
                  (active ? "border-gold/50" : "border-white/20")
                }
              />
              <motion.span
                className={"h-2 w-2 rounded-full " + (active ? "bg-gold" : "bg-white/30")}
                animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={active ? { duration: 1.8, repeat: Infinity } : undefined}
              />
              {active && (
                <span className="absolute inset-0 animate-pulse-soft rounded-full bg-gold/20 blur-sm" />
              )}
            </span>
            <span>
              <span className={"block text-sm font-semibold " + (active ? "text-gold" : "text-fg")}>
                {option.label}
              </span>
              <span className="block font-mono text-[10px] text-fg-subtle">{option.code}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
