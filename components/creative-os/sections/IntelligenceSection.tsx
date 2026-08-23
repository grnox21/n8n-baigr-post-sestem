"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";

const ORBIT_LABELS = [
  "بحث",
  "استراتيجية",
  "الفكرة الرئيسية",
  "التوجيه الإبداعي",
  "المفهوم البصري",
  "هندسة الطلب",
];

const RADIUS = 108;

function orbitPosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: `calc(50% + ${Math.cos(angle) * RADIUS}px)`,
    top: `calc(50% + ${Math.sin(angle) * RADIUS}px)`,
  };
}

function IntelligenceVisual() {
  const { state } = useCreativeOS();
  const active = state.generationStatus === "strategizing";
  const resolved = ["routing", "generating", "resizing", "ready", "approved"].includes(
    state.generationStatus
  );

  return (
    <GlassPanel tone="raised" className="relative flex flex-col items-center gap-6 overflow-hidden p-8 sm:p-10">
      <div className="relative h-64 w-64">
        <motion.div
          className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15"
          animate={{ scale: active ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
        >
          <span className="absolute inset-0 animate-pulse-soft rounded-full bg-gold/25 blur-xl" />
          <span className="absolute inset-4 rounded-full border border-gold/40" />
        </motion.div>

        {ORBIT_LABELS.map((label, i) => {
          const pos = orbitPosition(i, ORBIT_LABELS.length);
          return (
            <motion.span
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/[0.08] bg-black/40 px-2.5 py-1 font-mono text-[10px] text-fg-muted"
              style={pos}
              animate={
                active
                  ? { opacity: [0.35, 1, 0.35], scale: [0.95, 1.05, 0.95] }
                  : { opacity: 0.4, scale: 0.95 }
              }
              transition={
                active
                  ? { duration: 2.2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }
                  : { duration: 0.4 }
              }
            >
              {label}
            </motion.span>
          );
        })}
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: resolved ? 1 : 0.3, y: resolved ? 0 : 6 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 font-mono text-xs text-gold"
      >
        Creative Blueprint {resolved ? "✓" : "…"}
      </motion.div>
    </GlassPanel>
  );
}

export function IntelligenceSection() {
  return (
    <SectionShell
      id="intelligence"
      index="05"
      eyebrow="AI Creative Intelligence"
      title="هنا يُبنى المفهوم الإبداعي"
      description="لا نصوصًا تُكتب أمامك — بل عقل معالجة يبحث، يضع الاستراتيجية، ويحدد الفكرة والتوجيه البصري، ثم يدمج كل ذلك في مخطط إبداعي واحد جاهز للتوليد."
      visual={<IntelligenceVisual />}
    />
  );
}
