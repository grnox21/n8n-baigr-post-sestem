"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { CONTENT_TYPE_OPTIONS } from "@/lib/creative-os/constants";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { FlowConnector } from "../primitives/FlowConnector";

function TopicVisual() {
  const { state } = useCreativeOS();
  const contentTypeLabel =
    CONTENT_TYPE_OPTIONS.find((o) => o.id === state.contentType)?.label ?? "";

  const fragments = [
    { label: "الموضوع", value: state.topic || "—" },
    { label: "الجمهور", value: "أصحاب المتاجر والمواقع الرقمية" },
    { label: "هدف العمل", value: "زيادة معدل التحويل" },
    { label: "التوجيه البصري", value: "أسلوب نظيف واحترافي" },
    { label: "نوع المحتوى", value: contentTypeLabel },
  ];

  return (
    <GlassPanel tone="raised" className="flex flex-col gap-4 p-6 sm:p-7">
      {fragments.map((fragment, i) => (
        <motion.div
          key={fragment.label}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
            {fragment.label}
          </span>
          <span className="truncate text-sm text-fg-muted" dir="rtl">
            {fragment.value}
          </span>
        </motion.div>
      ))}

      <div className="flex flex-col items-center gap-2 pt-2">
        <FlowConnector direction="vertical" length={28} tone="signal" />
        <span className="font-mono text-[10px] tracking-wide text-fg-subtle">
          إلى عقل الإبداع
        </span>
      </div>
    </GlassPanel>
  );
}

export function TopicSection() {
  const { state, setTopic } = useCreativeOS();

  return (
    <SectionShell
      id="topic"
      index="04"
      eyebrow="Topic Input"
      title="فكرة واحدة، والنظام يبني حولها كل شيء"
      description="تكتب موضوعك بجملة واحدة بسيطة. يفكك النظام هذه الجملة تلقائيًا إلى عناصر منظمة — الجمهور، هدف العمل، التوجيه البصري — قبل أن تدخل إلى عقل الإبداع."
      visual={<TopicVisual />}
    >
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
          الموضوع
        </span>
        <textarea
          value={state.topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="اكتب موضوع المحتوى…"
          className="w-full resize-none rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-[15px] leading-7 text-fg placeholder:text-fg-subtle focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </label>
    </SectionShell>
  );
}
