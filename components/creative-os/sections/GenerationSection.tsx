"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { MODEL_OPTIONS } from "@/lib/creative-os/constants";
import { ratioBoxSize } from "@/lib/creative-os/logic";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";

const STEPS = [
  { key: "strategizing", label: "الاستراتيجية" },
  { key: "routing", label: "التوجيه" },
  { key: "generating", label: "التوليد" },
  { key: "resizing", label: "تهيئة القياس" },
  { key: "ready", label: "جاهز" },
] as const;

function StepTracker({ resizeRequired }: { resizeRequired: boolean }) {
  const { state } = useCreativeOS();
  const steps = resizeRequired ? STEPS : STEPS.filter((s) => s.key !== "resizing");
  const order = steps.map((s) => s.key);
  const currentIndex =
    state.generationStatus === "ready" ||
    state.generationStatus === "approved" ||
    state.generationStatus === "revision_requested"
      ? order.length - 1
      : order.indexOf(state.generationStatus as (typeof order)[number]);

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => {
        const done = currentIndex > i || state.generationStatus === "ready";
        const active = currentIndex === i;
        return (
          <div key={step.key} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <motion.span
                className={
                  "h-1.5 w-full rounded-full " +
                  (done || active ? "bg-gold" : "bg-white/10")
                }
                animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
                transition={active ? { duration: 1, repeat: Infinity } : undefined}
              />
              <span
                className={
                  "font-mono text-[9px] " + (done || active ? "text-gold" : "text-fg-subtle")
                }
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompatibilityPanel() {
  const { state, compatibility } = useCreativeOS();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setChecking(true);
    const t = setTimeout(() => setChecking(false), 550);
    return () => clearTimeout(t);
  }, [state.model, state.aspectRatio]);

  return (
    <GlassPanel className="flex flex-col gap-3 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
        فحص التوافق مع القياس
      </p>
      <div className="grid grid-cols-3 gap-2">
        <MetadataBadge label="المطلوب" value={compatibility.requested} />
        <MetadataBadge
          label="دعم النموذج"
          value={checking ? "…" : compatibility.supported ? "✓ مدعوم" : "غير أصلي"}
        />
        <MetadataBadge
          label="النتيجة"
          value={checking ? "جارِ الفحص" : compatibility.resizeRequired ? "تهيئة تلقائية" : "توليد مباشر"}
          accent
        />
      </div>
    </GlassPanel>
  );
}

function GenerationVisual() {
  const { state, compatibility, runGeneration } = useCreativeOS();
  const status = state.generationStatus;
  const isEmpty = status === "idle" || status === "strategizing" || status === "routing";
  const isSynth = status === "generating";
  const isDone = ["resizing", "ready", "approved", "revision_requested"].includes(status);

  const displayRatio = isDone ? compatibility.requested : compatibility.nativeRatio;
  const box = ratioBoxSize(displayRatio, 180);
  const model = MODEL_OPTIONS.find((m) => m.id === state.model)!;

  const blur = isEmpty ? 22 : isSynth ? 6 : 0;
  const noiseOpacity = isEmpty ? 0.85 : isSynth ? 0.25 : 0.02;
  const contentOpacity = isEmpty ? 0.1 : isSynth ? 0.7 : 1;

  const taskLabel =
    status === "idle"
      ? "بانتظار الإنشاء"
      : status === "generating"
        ? "قيد المعالجة"
        : isDone
          ? "اكتملت"
          : "تم إنشاء المهمة";

  return (
    <GlassPanel tone="raised" className="flex flex-col gap-6 p-8 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MetadataBadge label="TASK" value={taskLabel} accent={isDone} />
        <button
          type="button"
          onClick={() => void runGeneration()}
          disabled={isSynth || status === "strategizing" || status === "routing" || status === "resizing"}
          className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDone ? "إعادة التوليد" : "▶ ابدأ التوليد"}
        </button>
      </div>

      <div className="flex h-[210px] items-center justify-center">
        <motion.div
          animate={{ width: box.width, height: box.height }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          className="relative overflow-hidden rounded-lg border border-gold/30 bg-black/40"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(217,165,92,0.5), transparent 55%), radial-gradient(circle at 70% 70%, rgba(95,227,198,0.35), transparent 55%)",
              filter: `blur(${blur}px)`,
              opacity: contentOpacity,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <motion.div
            className="noise-veil absolute inset-0"
            animate={{ opacity: noiseOpacity }}
            transition={{ duration: 1 }}
          />
          {isSynth && (
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ left: ["-40%", "120%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      <StepTracker resizeRequired={compatibility.resizeRequired} />

      <div className="grid grid-cols-3 gap-2">
        <MetadataBadge label="MODEL" value={model.code} />
        <MetadataBadge label="RATIO" value={displayRatio} />
        <MetadataBadge label="QUALITY" value={state.quality} />
      </div>

      {compatibility.resizeRequired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: status === "resizing" || isDone ? 1 : 0.35 }}
          className="flex flex-col gap-2 rounded-xl border border-signal/25 bg-signal/[0.06] p-4"
        >
          <div className="flex items-center justify-between font-mono text-[10px] text-signal">
            <span>{compatibility.nativeRatio}</span>
            <span>محرك القياس الذكي ←</span>
            <span>{compatibility.requested}</span>
          </div>
          <p className="text-xs leading-6 text-fg-muted">
            المحتوى محفوظ بالكامل — لا تغيير في العناصر أو الألوان أو التركيب، فقط تهيئة الإطار
            للقياس المطلوب.
          </p>
        </motion.div>
      )}
    </GlassPanel>
  );
}

export function GenerationSection() {
  return (
    <SectionShell
      id="generation"
      index="07"
      eyebrow="Generation & Smart Resize"
      title="التوليد، وتهيئة القياس عند الحاجة"
      description="إن كان القياس مدعومًا أصلًا من النموذج، يبدأ التوليد المباشر فورًا. أما إن لم يدعم GPT2 القياس المطلوب، فإن النظام يولّد بأقرب قياس أصلي ثم يمرر الناتج تلقائيًا إلى محرك التهيئة الذكي — دون إعادة تصميم الصورة."
      visual={<GenerationVisual />}
    >
      <CompatibilityPanel />
    </SectionShell>
  );
}
