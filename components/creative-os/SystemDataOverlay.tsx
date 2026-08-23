"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreativeOS } from "@/lib/creative-os/CreativeOSProvider";

/** Optional developer overlay exposing the underlying state-machine shape. */
export function SystemDataOverlay() {
  const { state, compatibility } = useCreativeOS();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-40 hidden sm:block" dir="ltr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-white/10 bg-ink-900/80 px-3 py-1.5 font-mono text-[10px] text-fg-subtle backdrop-blur-md transition hover:border-white/25 hover:text-fg-muted"
      >
        {open ? "close" : "system data"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.pre
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mt-2 max-w-xs overflow-auto rounded-xl border border-white/10 bg-ink-900/95 p-4 font-mono text-[10px] leading-5 text-fg-muted shadow-panel backdrop-blur-xl"
          >
            {JSON.stringify(
              {
                telegram_chat_id: state.telegramChatId,
                state: `awaiting_${state.generationStatus === "idle" ? "topic" : state.generationStatus}`,
                content_type: state.contentType,
                model_choice: state.model,
                aspect_ratio: state.aspectRatio,
                generation_aspect_ratio: compatibility.nativeRatio,
                resize_required: compatibility.resizeRequired,
                quality: state.quality,
                status: state.generationStatus,
                version: state.version,
              },
              null,
              2
            )}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}
