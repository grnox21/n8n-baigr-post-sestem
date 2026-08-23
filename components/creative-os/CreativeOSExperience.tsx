"use client";

import { motion } from "framer-motion";
import { CreativeOSProvider } from "@/lib/creative-os/CreativeOSProvider";
import { HeroShowcase } from "./hero/HeroShowcase";
import { TelegramSection } from "./sections/TelegramSection";
import { ModelSection } from "./sections/ModelSection";
import { FormatSection } from "./sections/FormatSection";
import { TopicSection } from "./sections/TopicSection";
import { IntelligenceSection } from "./sections/IntelligenceSection";
import { RouterSection } from "./sections/RouterSection";
import { GenerationSection } from "./sections/GenerationSection";
import { PreviewSection } from "./sections/PreviewSection";
import { DistributionSection } from "./sections/DistributionSection";
import { SystemDataOverlay } from "./SystemDataOverlay";

function Divider() {
  return (
    <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-l from-transparent via-white/[0.07] to-transparent" />
  );
}

export function CreativeOSExperience() {
  return (
    <div className="relative">
      <section className="relative flex flex-col items-center gap-14 px-6 pb-24 pt-28 sm:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-center"
        >
          <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] tracking-[0.16em] text-fg-subtle">
            BAIGR CREATIVE OS
          </span>
          <h1 className="text-3xl font-bold leading-[1.25] text-fg sm:text-5xl">
            نظام تشغيل إبداعي، يعمل بالذكاء الاصطناعي،
            <br className="hidden sm:block" /> تُديره بالكامل من تيليجرام
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-8 text-fg-muted">
            تختار النوع، النموذج، القياس، والجودة — والنظام يبني الفكرة، يوجّه المهمة إلى المحرك
            الصحيح، وينتج المحتوى بدقة، دون أن تغادر المحادثة.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <HeroShowcase />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col items-center gap-2 text-fg-subtle"
        >
          <span className="font-mono text-[11px] tracking-wide">مرّر للأسفل لاكتشاف كل مرحلة</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-8 w-px bg-gradient-to-b from-fg-subtle to-transparent"
          />
        </motion.div>
      </section>

      <CreativeOSProvider>
        <Divider />
        <TelegramSection />
        <Divider />
        <ModelSection />
        <Divider />
        <FormatSection />
        <Divider />
        <TopicSection />
        <Divider />
        <IntelligenceSection />
        <Divider />
        <RouterSection />
        <Divider />
        <GenerationSection />
        <Divider />
        <PreviewSection />
        <Divider />
        <DistributionSection />
        <SystemDataOverlay />
      </CreativeOSProvider>
    </div>
  );
}
