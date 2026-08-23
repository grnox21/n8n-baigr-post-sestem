"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { MODEL_OPTIONS } from "@/lib/creative-os/constants";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";
import type { ModelChoice } from "@/lib/creative-os/types";

const BRANCH_X: Record<ModelChoice, number> = {
  auto: 30,
  gpt2: 110,
  nano_banana_2: 190,
  nano_banana_pro: 270,
};

function RouterVisual() {
  const { state } = useCreativeOS();
  const active = state.generationStatus === "routing";

  return (
    <GlassPanel tone="raised" className="flex flex-col gap-6 p-8 sm:p-10">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetadataBadge label="CONTENT_TYPE" value={state.contentType} />
        <MetadataBadge label="MODEL_CHOICE" value={state.model} accent />
        <MetadataBadge label="ASPECT_RATIO" value={state.aspectRatio} />
        <MetadataBadge label="QUALITY" value={state.quality} />
      </div>

      <svg viewBox="0 0 300 150" className="w-full">
        {MODEL_OPTIONS.map((option) => {
          const selected = option.id === state.model;
          return (
            <motion.line
              key={option.id}
              x1={150}
              y1={14}
              x2={BRANCH_X[option.id]}
              y2={130}
              stroke={selected ? "#d9a55c" : "rgba(255,255,255,0.12)"}
              strokeWidth={selected ? 1.8 : 1}
              animate={
                selected && active
                  ? { strokeDashoffset: [0, -16] }
                  : undefined
              }
              strokeDasharray={selected ? "4 4" : undefined}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          );
        })}
        <circle cx={150} cy={12} r="7" fill="#d9a55c" opacity={0.9} />
        {MODEL_OPTIONS.map((option) => {
          const selected = option.id === state.model;
          return (
            <g key={option.id}>
              <circle
                cx={BRANCH_X[option.id]}
                cy={132}
                r={selected ? 5 : 3.5}
                fill={selected ? "#d9a55c" : "rgba(255,255,255,0.25)"}
              />
              <text
                x={BRANCH_X[option.id]}
                y={148}
                textAnchor="middle"
                fontSize="8"
                style={{ fontFamily: "ui-monospace, monospace" }}
                fill={selected ? "#ecc98c" : "rgba(255,255,255,0.35)"}
              >
                {option.code.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </GlassPanel>
  );
}

export function RouterSection() {
  return (
    <SectionShell
      id="router"
      index="06"
      eyebrow="Model Router"
      title="التوجيه الذكي نحو المحرك الصحيح"
      description="يصل المخطط الإبداعي إلى نقطة قرار ذكية تعرف نوع المحتوى، النموذج، القياس، والجودة، وتوجّه المهمة تلقائيًا إلى محرك التوليد المناسب — بينما تبقى بقية المسارات مرئية وخافتة."
      visual={<RouterVisual />}
    />
  );
}
