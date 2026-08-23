"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { QUALITY_OPTIONS } from "@/lib/creative-os/constants";
import { ratioBoxSize } from "@/lib/creative-os/logic";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";
import { AspectRatioSelector } from "../controls/AspectRatioSelector";
import { QualitySelector } from "../controls/QualitySelector";

function FormatVisual() {
  const { state } = useCreativeOS();
  const box = ratioBoxSize(state.aspectRatio, 176);
  const quality = QUALITY_OPTIONS.find((q) => q.id === state.quality)!;
  const cell = 100 / quality.gridDensity;

  return (
    <GlassPanel tone="raised" className="flex flex-col items-center gap-7 p-8 sm:p-10">
      <div className="flex h-[196px] w-full items-center justify-center">
        <motion.div
          animate={{ width: box.width, height: box.height }}
          transition={{ type: "spring", stiffness: 170, damping: 22 }}
          className="relative overflow-hidden rounded-lg border border-gold/40 bg-gold/[0.04]"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundImage: `radial-gradient(circle, rgba(217,165,92,0.55) 0.6px, transparent 0.6px)`,
              backgroundSize: `${cell}% ${cell}%`,
            }}
            transition={{ duration: 0.5 }}
          />
          <span className="absolute inset-0 shadow-[inset_0_0_30px_rgba(217,165,92,0.15)]" />
        </motion.div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5">
        <MetadataBadge label="FORMAT" value={state.aspectRatio} accent />
        <MetadataBadge label="QUALITY" value={state.quality} />
      </div>
    </GlassPanel>
  );
}

export function FormatSection() {
  const { state, setAspectRatio, setQuality } = useCreativeOS();

  return (
    <SectionShell
      id="format"
      index="03"
      eyebrow="Format & Quality"
      title="القياس الدقيق والجودة التي تريدها"
      description="يتذكر النظام الصيغة المستهدفة لكل مشروع — من المربع الكلاسيكي إلى الستوري الطويل — ويضبط كثافة التفاصيل بحسب الجودة المطلوبة، من 1K إلى 4K الفائقة الدقة."
      visual={<FormatVisual />}
    >
      <div className="flex flex-col gap-5">
        <AspectRatioSelector value={state.aspectRatio} onChange={setAspectRatio} />
        <QualitySelector value={state.quality} onChange={setQuality} />
      </div>
    </SectionShell>
  );
}
