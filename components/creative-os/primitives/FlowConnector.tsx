"use client";

import { motion } from "framer-motion";

interface FlowConnectorProps {
  direction?: "vertical" | "horizontal";
  length?: number | string;
  active?: boolean;
  tone?: "gold" | "signal";
}

/** A thin animated line representing data physically traveling between stages. */
export function FlowConnector({
  direction = "vertical",
  length = 40,
  active = true,
  tone = "gold",
}: FlowConnectorProps) {
  const color = tone === "gold" ? "#d9a55c" : "#5fe3c6";
  const isVertical = direction === "vertical";

  return (
    <div
      className="relative flex items-center justify-center"
      style={
        isVertical
          ? { height: typeof length === "number" ? `${length}px` : length, width: 2 }
          : { width: typeof length === "number" ? `${length}px` : length, height: 2 }
      }
    >
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.03] via-white/[0.12] to-white/[0.03]"
        style={
          isVertical
            ? undefined
            : { backgroundImage: "linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)" }
        }
      />
      {active && (
        <motion.div
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px 2px ${color}66` }}
          animate={
            isVertical
              ? { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }
              : { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
