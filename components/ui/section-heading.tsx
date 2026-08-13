"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHashPulse } from "@/hooks/use-hash-pulse";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** Use the light eyebrow pill + white heading text for dark section backgrounds. */
  dark?: boolean;
  className?: string;
  titleClassName?: string;
};

// Eyebrow pill + h2 (+ optional description) intro block, with the standard
// whileInView reveal — this exact block was duplicated across ~11 sections.
export function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
  className,
  titleClassName,
}: Readonly<SectionHeadingProps>) {
  const { ref: headingRef, pulse } = useHashPulse<HTMLHeadingElement>();

  return (
    <div className={className}>
      <motion.div
        className={cn("inline-block eyebrow-pill mb-4", dark && "eyebrow-pill-dark")}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow-pill-text">{eyebrow}</span>
      </motion.div>

      <motion.h2
        ref={headingRef}
        className={cn(
          "text-4xl lg:text-5xl font-black leading-tight",
          dark ? "text-white" : "text-zinc-900",
          titleClassName
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        <motion.span
          animate={pulse ? { scale: [1, 1.05, 1], color: ["inherit", "var(--brand-primary)", "inherit"] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-block origin-left"
        >
          {title}
        </motion.span>
      </motion.h2>

      {description && (
        <motion.p
          className={cn("text-sm mt-2", dark ? "text-white/50" : "text-zinc-400")}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
