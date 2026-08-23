"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/creative-os/useReducedMotion";
import { ratioBoxSize } from "@/lib/creative-os/logic";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";
import { HERO_NODES, HERO_TIMELINE } from "./timeline";

const LOOP_PAUSE = 1400;

export function HeroShowcase() {
  const reduced = useReducedMotion();
  const [frameIndex, setFrameIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (reduced) return;
    const frame = HERO_TIMELINE[frameIndex % HERO_TIMELINE.length]!;
    const isLast = frameIndex % HERO_TIMELINE.length === HERO_TIMELINE.length - 1;
    timeoutRef.current = setTimeout(
      () => setFrameIndex((i) => i + 1),
      frame.duration + (isLast ? LOOP_PAUSE : 0)
    );
    return () => clearTimeout(timeoutRef.current);
  }, [frameIndex, reduced]);

  const frame = reduced
    ? HERO_TIMELINE[HERO_TIMELINE.length - 1]!
    : HERO_TIMELINE[frameIndex % HERO_TIMELINE.length]!;
  const box = ratioBoxSize(frame.displayRatio, 128);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade" />

      <GlassPanel tone="raised" className="p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] tracking-wide text-fg-subtle">
            {frame.scenario === 1 ? "المشهد 01 — توليد مباشر" : "المشهد 02 — تهيئة قياس تلقائية"}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={frame.label}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35 }}
              className="text-xs font-medium text-fg-muted"
            >
              {frame.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* pipeline strip */}
        <div className="mb-8 flex items-center">
          {HERO_NODES.map((label, i) => {
            const active = i === frame.node;
            const passed = i < frame.node;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <motion.span
                    animate={{
                      scale: active ? 1.25 : 1,
                      backgroundColor: active || passed ? "#d9a55c" : "rgba(255,255,255,0.15)",
                      boxShadow: active ? "0 0 14px 2px rgba(217,165,92,0.6)" : "0 0 0 rgba(0,0,0,0)",
                    }}
                    transition={{ duration: 0.4 }}
                    className="h-2.5 w-2.5 rounded-full"
                  />
                  <span
                    className={
                      "hidden text-center font-mono text-[9px] leading-tight sm:block " +
                      (active ? "text-gold" : "text-fg-subtle")
                    }
                    style={{ maxWidth: 64 }}
                  >
                    {label}
                  </span>
                </div>
                {i < HERO_NODES.length - 1 && (
                  <div className="mx-1 h-px flex-1 bg-white/10 sm:mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <motion.div
              animate={{ width: box.width, height: box.height }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="relative overflow-hidden rounded-lg border border-gold/30 bg-black/40"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: frame.status === "idle" ? 0.15 : 1,
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(217,165,92,0.5), transparent 55%), radial-gradient(circle at 70% 70%, rgba(95,227,198,0.35), transparent 55%)",
                }}
                transition={{ duration: 0.8 }}
              />
              {frame.status === "generating" && (
                <div className="noise-veil absolute inset-0" style={{ opacity: 0.4 }} />
              )}
              {frame.status === "approved" && (
                <span className="absolute inset-x-0 bottom-0 bg-emerald-400/90 py-0.5 text-center font-mono text-[9px] font-semibold text-ink-950">
                  APPROVED
                </span>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetadataBadge label="MODEL" value={frame.model} accent />
            <MetadataBadge label="FORMAT" value={frame.ratio} />
            <MetadataBadge label="QUALITY" value={frame.quality} />
            <MetadataBadge label="STATUS" value={frame.status.toUpperCase()} />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
