"use client";

import { motion } from "framer-motion";
import type { GenerationStatus } from "@/lib/creative-os/types";
import { STATUS_LABELS } from "@/lib/creative-os/constants";

const TONE: Record<GenerationStatus, string> = {
  idle: "bg-white/10 text-fg-muted",
  strategizing: "bg-gold/15 text-gold",
  routing: "bg-gold/15 text-gold",
  generating: "bg-signal/15 text-signal",
  resizing: "bg-signal/15 text-signal",
  ready: "bg-emerald-400/15 text-emerald-300",
  approved: "bg-emerald-400/20 text-emerald-300",
  revision_requested: "bg-amber-400/15 text-amber-300",
  cancelled: "bg-red-400/10 text-red-300",
};

const ACTIVE: GenerationStatus[] = ["strategizing", "routing", "generating", "resizing"];

export function StatusPill({ status }: { status: GenerationStatus }) {
  const busy = ACTIVE.includes(status);
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] tracking-wide " +
        TONE[status]
      }
    >
      <motion.span
        className="h-1.5 w-1.5 rounded-full bg-current"
        animate={busy ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={busy ? { duration: 1.1, repeat: Infinity } : undefined}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
