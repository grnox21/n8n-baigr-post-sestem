"use client";

import { motion } from "framer-motion";
import { CONTENT_TYPE_OPTIONS } from "@/lib/creative-os/constants";
import type { ContentType } from "@/lib/creative-os/types";
import {
  IconAuto,
  IconCarousel,
  IconImage,
  IconTalkingHead,
  IconVideo,
} from "./icons";

const ICONS: Record<ContentType, (props: { className?: string }) => JSX.Element> = {
  image: IconImage,
  carousel: IconCarousel,
  video: IconVideo,
  talking_head: IconTalkingHead,
  auto: IconAuto,
};

export function ContentTypeSelector({
  value,
  onChange,
}: {
  value: ContentType;
  onChange: (v: ContentType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="نوع المحتوى">
      {CONTENT_TYPE_OPTIONS.map((option) => {
        const Icon = ICONS[option.id];
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={
              "group relative flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 " +
              (active
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-white/[0.08] bg-white/[0.02] text-fg-muted hover:border-white/20 hover:text-fg")
            }
          >
            {active && (
              <motion.span
                layoutId="content-type-active"
                className="absolute inset-0 rounded-xl bg-gold/5"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
