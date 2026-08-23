"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionShellProps {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
  children?: ReactNode;
  id?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Shared two-column layout for every stage of the Creative OS narrative. */
export function SectionShell({
  index,
  eyebrow,
  title,
  description,
  visual,
  children,
  id,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-8"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="order-2 lg:order-1"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-gold">{index}</span>
          <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-gold/50 to-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
            {eyebrow}
          </span>
        </div>
        <h3 className="text-2xl font-bold leading-tight text-fg md:text-3xl">{title}</h3>
        <p className="mt-4 max-w-md text-[15px] leading-8 text-fg-muted">{description}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="order-1 lg:order-2"
      >
        {visual}
      </motion.div>
    </section>
  );
}
