"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function Brands() {
  const t = useTranslations("brands");
  const industries = t.raw("industries") as string[];
  const marqueeText = industries.join("   ·   ") + "   ·   ";

  return (
    <section className="relative w-full bg-white py-14 lg:py-20 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="flex items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="hidden sm:block h-px flex-1 max-w-[180px] bg-zinc-200" />
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-zinc-400 shrink-0">
            {t("title")}
          </p>
          <span className="hidden sm:block h-px flex-1 max-w-[180px] bg-zinc-200" />
        </motion.div>
      </div>

      <div
        className="overflow-hidden select-none"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-2xl sm:text-3xl font-black text-zinc-200 tracking-tight pr-0">
            {marqueeText}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-zinc-200 tracking-tight pr-0">
            {marqueeText}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
