"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { ratioBoxSize } from "@/lib/creative-os/logic";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { MetadataBadge } from "../primitives/MetadataBadge";
import { StatusPill } from "../primitives/StatusPill";
import { IconDelete, IconPublish, IconRevise } from "../controls/icons";

const DEFAULT_NOTE = "اجعل التكوين أنظف وقلل من التعقيد البصري.";

function PreviewVisual() {
  const { state, compatibility, approve, requestRevision, cancelProject, startNewProject } =
    useCreativeOS();
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [showNote, setShowNote] = useState(false);

  const ready = ["ready", "approved", "revision_requested"].includes(state.generationStatus);
  const cancelled = state.generationStatus === "cancelled";
  const approved = state.generationStatus === "approved";
  const box = ratioBoxSize(state.aspectRatio, 168);

  return (
    <GlassPanel tone="raised" className="p-5">
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-mono text-sm font-semibold text-gold">
          B
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-fg">BAIGR Creative OS</p>
          <p className="text-[11px] text-fg-subtle">معاينة النسخة {state.version}</p>
        </div>
        <StatusPill status={state.generationStatus} />
      </div>

      <div className="mt-4 flex min-h-[220px] items-center justify-center">
        <AnimatePresence mode="wait">
          {cancelled ? (
            <motion.div
              key="cancelled"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.5, filter: "blur(6px)", scale: 0.94 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-red-300">CANCELLED</span>
              <p className="max-w-[220px] text-xs text-fg-subtle">
                تم إلغاء المشروع وخروجه من خط الإنتاج النشط.
              </p>
            </motion.div>
          ) : !ready ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="h-24 w-24 animate-pulse-soft rounded-lg border border-dashed border-white/15" />
              <p className="text-xs text-fg-subtle">بانتظار اكتمال التوليد…</p>
            </motion.div>
          ) : (
            <motion.div
              key="asset"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: box.width, height: box.height }}
              className="relative overflow-hidden rounded-lg border border-gold/30"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(217,165,92,0.55), transparent 55%), radial-gradient(circle at 70% 70%, rgba(95,227,198,0.4), transparent 55%)",
                }}
              />
              {approved && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-0 bottom-0 bg-emerald-400/90 py-1 text-center font-mono text-[10px] font-semibold text-ink-950"
                >
                  APPROVED
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <MetadataBadge label="MODEL" value={state.model} />
        <MetadataBadge label="FORMAT" value={compatibility.requested} />
        <MetadataBadge label="QUALITY" value={state.quality} />
        <MetadataBadge label="STATUS" value={cancelled ? "CANCELLED" : ready ? "READY" : "…"} accent />
      </div>

      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-3 w-full resize-none rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-gold/40 focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={!ready || approved || cancelled}
          onClick={approve}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconPublish className="h-3.5 w-3.5" /> انشر
        </button>
        <button
          type="button"
          disabled={!ready || approved || cancelled}
          onClick={() => {
            if (showNote) {
              setShowNote(false);
              requestRevision();
            } else {
              setShowNote(true);
            }
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconRevise className="h-3.5 w-3.5" /> {showNote ? "تأكيد التعديل" : "عدّل"}
        </button>
        <button
          type="button"
          disabled={!ready || approved || cancelled}
          onClick={cancelProject}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-400/30 bg-red-400/10 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconDelete className="h-3.5 w-3.5" /> احذف
        </button>
      </div>

      {(approved || cancelled) && (
        <button
          type="button"
          onClick={() => {
            setShowNote(false);
            startNewProject();
          }}
          className="mt-3 w-full rounded-lg border border-white/10 py-2 text-[11px] text-fg-muted transition hover:border-white/25 hover:text-fg"
        >
          مشروع جديد
        </button>
      )}
    </GlassPanel>
  );
}

export function PreviewSection() {
  return (
    <SectionShell
      id="preview"
      index="08"
      eyebrow="Telegram Preview"
      title="النتيجة تعود إليك في تيليجرام"
      description="تصلك الصورة النهائية داخل نفس المحادثة، مرفقة بثلاثة قرارات بسيطة: انشرها، اطلب تعديلًا مع ملاحظتك الخاصة، أو احذفها بالكامل. القرار دائمًا بيدك."
      visual={<PreviewVisual />}
    />
  );
}
