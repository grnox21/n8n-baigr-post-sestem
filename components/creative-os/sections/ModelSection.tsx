"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { MODEL_OPTIONS } from "@/lib/creative-os/constants";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";
import { ModelSelector } from "../controls/ModelSelector";

function ModelVisual() {
  const { state } = useCreativeOS();
  const option = MODEL_OPTIONS.find((o) => o.id === state.model)!;

  return (
    <GlassPanel tone="raised" className="flex flex-col items-center gap-8 p-8 sm:p-10">
      <div className="relative flex h-40 w-40 items-center justify-center">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border border-gold/25"
            style={{ inset: ring * 18 }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 14 + ring * 6, repeat: Infinity, ease: "linear" }}
          />
        ))}
        <motion.div
          key={state.model}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold/15"
        >
          <span className="absolute inset-0 animate-pulse-soft rounded-full bg-gold/25 blur-lg" />
          <span className="relative h-3 w-3 rounded-full bg-gold shadow-glow" />
        </motion.div>
      </div>

      <div className="flex h-10 items-end gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-1 rounded-full bg-gold/40"
            animate={{ height: [6, 10 + ((i * 7) % 24), 6] }}
            transition={{
              duration: 1.6 + (i % 4) * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.08,
            }}
          />
        ))}
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5">
        <MetadataBadge label="MODEL" value={option.code} accent />
        <MetadataBadge label="STATUS" value="READY" />
      </div>
    </GlassPanel>
  );
}

export function ModelSection() {
  const { state, setModel } = useCreativeOS();

  return (
    <SectionShell
      id="model"
      index="02"
      eyebrow="Model Selection"
      title="أنت من يختار عقل التوليد"
      description="كل نموذج وحدة معالجة مستقلة بقدرات مختلفة. تختار النموذج المناسب لمشروعك، ويضيء النظام الوحدة المختارة بينما تبقى بقية النماذج جاهزة وخافتة في الخلفية."
      visual={<ModelVisual />}
    >
      <ModelSelector value={state.model} onChange={setModel} />
    </SectionShell>
  );
}
