"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WipeButton } from "@/components/ui/wipe-button";
import { useSectionInView } from "@/hooks/use-section-in-view";

export default function CtaBanner() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("ctaBanner");

  return (
    <section className="relative w-full overflow-hidden py-12 lg:py-16">
      <Image
        src="https://picsum.photos/seed/vd-cta-banner/1600/500"
        alt=""
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-0 bg-brand-dark/85" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
            {t("title")}
          </h2>
          <p className="mt-2 text-base text-white/70 font-medium">{t("subtitle")}</p>
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <WipeButton href="/#cta" tone="primary" size="md">
            {t("ctaQuote")}
          </WipeButton>
          <WipeButton href="/products" tone="dark" size="md">
            {t("ctaProducts")}
          </WipeButton>
        </motion.div>
      </div>
    </section>
  );
}
