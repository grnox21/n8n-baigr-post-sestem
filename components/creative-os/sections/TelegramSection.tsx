"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";
import { CONTENT_TYPE_OPTIONS } from "@/lib/creative-os/constants";
import { SectionShell } from "../primitives/SectionShell";
import { GlassPanel } from "../primitives/GlassPanel";
import { ContentTypeSelector } from "../controls/ContentTypeSelector";
import {
  IconAuto,
  IconCarousel,
  IconImage,
  IconTalkingHead,
  IconVideo,
} from "../controls/icons";
import type { ContentType } from "@/lib/creative-os/types";

const ICONS: Record<ContentType, (props: { className?: string }) => JSX.Element> = {
  image: IconImage,
  carousel: IconCarousel,
  video: IconVideo,
  talking_head: IconTalkingHead,
  auto: IconAuto,
};

function TelegramVisual() {
  const { state } = useCreativeOS();
  const option = CONTENT_TYPE_OPTIONS.find((o) => o.id === state.contentType)!;
  const Icon = ICONS[state.contentType];

  return (
    <div className="relative flex justify-center py-6">
      <div className="pointer-events-none absolute inset-0 bg-grid-fade" />
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 6, rotateX: 3 }}
        animate={{ rotateY: [6, 2, 6], rotateX: [3, 1, 3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full max-w-sm"
      >
        <GlassPanel tone="raised" className="p-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-mono text-sm font-semibold text-gold">
              B
              <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">BAIGR Creative OS</p>
              <p className="text-[11px] text-fg-subtle">مساعد المحتوى الذكي · متصل الآن</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5 text-[13px] leading-relaxed text-fg-muted">
              اختر نوع المحتوى الذي تريد إنتاجه
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={state.contentType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="ms-auto flex max-w-[80%] items-center gap-2 rounded-2xl rounded-tr-sm border border-gold/30 bg-gold/10 px-4 py-2.5 text-[13px] font-medium text-gold"
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            <div className="relative h-px flex-1 overflow-hidden bg-white/[0.08]">
              <motion.span
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-signal to-transparent"
                animate={{ left: ["-10%", "110%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="font-mono text-[10px] tracking-wide text-fg-subtle">إلى النظام</span>
          </div>
        </GlassPanel>

        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gold/10 blur-3xl" />
      </motion.div>
    </div>
  );
}

export function TelegramSection() {
  const { state, setContentType } = useCreativeOS();

  return (
    <SectionShell
      id="telegram"
      index="01"
      eyebrow="Telegram Command Center"
      title="أنت من يتحكم — مباشرة من تيليجرام"
      description="تبدأ كل عملية إنتاج من محادثة واحدة. لا لوحات تحكم معقدة، ولا واجهات إضافية — فقط رسالة تختار من خلالها نوع المحتوى الذي تريده، ويتولى النظام الباقي."
      visual={<TelegramVisual />}
    >
      <ContentTypeSelector value={state.contentType} onChange={setContentType} />
    </SectionShell>
  );
}
