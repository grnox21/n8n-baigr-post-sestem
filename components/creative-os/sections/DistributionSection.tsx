"use client";

import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { FlowConnector } from "../primitives/FlowConnector";

const PLATFORMS = ["Instagram", "Facebook", "TikTok", "Pinterest"];

function DistributionVisual() {
  const { state } = useCreativeOS();
  const approved = state.generationStatus === "approved";
  const revising = state.generationStatus === "revision_requested";
  const cancelled = state.generationStatus === "cancelled";

  return (
    <GlassPanel tone="raised" className="flex flex-col items-center gap-6 p-8 sm:p-10">
      <div className="flex flex-col items-center gap-2">
        <span
          className={
            "flex h-12 w-12 items-center justify-center rounded-full border " +
            (approved ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/15 bg-white/[0.03]")
          }
        >
          <span
            className={
              "h-3 w-3 rounded-full " + (approved ? "bg-emerald-300" : "bg-white/25")
            }
          />
        </span>
        <span className="font-mono text-[10px] text-fg-subtle">الأصل المعتمد</span>
      </div>

      <FlowConnector direction="vertical" length={26} active={approved} tone="signal" />

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {PLATFORMS.map((platform, i) => (
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={
              "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-colors duration-500 " +
              (approved
                ? "border-gold/30 bg-gold/[0.06]"
                : "border-white/[0.07] bg-white/[0.02]")
            }
          >
            <span
              className={
                "h-7 w-7 rounded-lg border " +
                (approved ? "border-gold/50 bg-gold/15" : "border-white/15")
              }
            />
            <span className="text-[11px] font-medium text-fg-muted">{platform}</span>
            <span className="font-mono text-[9px] text-fg-subtle">جاهز للربط</span>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-[11px] leading-6 text-fg-subtle">
        {cancelled
          ? "لا يوجد نشاط توزيع — تم إلغاء هذا المشروع."
          : revising
            ? "بانتظار اعتماد النسخة الجديدة قبل التوزيع."
            : approved
              ? "تم اعتماد الأصل — جاهز للنشر عبر المنصات المتصلة."
              : "طبقة توزيع قابلة للتوسّع — تُفعَّل عند اعتماد المحتوى وربط الحسابات."}
      </p>
    </GlassPanel>
  );
}

export function DistributionSection() {
  return (
    <SectionShell
      id="distribution"
      index="09"
      eyebrow="Distribution"
      title="من الموافقة إلى النشر"
      description="بمجرد اعتماد المحتوى، يتحرك تلقائيًا نحو طبقة التوزيع. المنصات هنا تمثيل مفاهيمي لبنية قابلة للتوسّع — تُفعَّل فعليًا فقط عند ربط الحسابات المعنية."
      visual={<DistributionVisual />}
    />
  );
}
