"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { IconBadge } from "@/components/ui/icon-badge";
import { WipeButton } from "@/components/ui/wipe-button";

export default function CTA() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("cta");
  const tContact = useTranslations("contact");

  return (
    <section
      id="cta"
      className="relative w-full bg-brand-primary flex items-center overflow-hidden py-16 lg:py-24 scroll-mt-16 lg:scroll-mt-[104px]"
    >
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div
          className="inline-block eyebrow-pill eyebrow-pill-dark mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow-pill-text">{t("eyebrow")}</span>
        </motion.div>

        <motion.h2
          className="text-5xl lg:text-7xl font-black text-white leading-tight mb-10"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("title")}
        </motion.h2>

        <motion.p
          className="text-white/80 text-lg max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          <WipeButton href="tel:0901448377" tone="light" size="lg" className="text-brand-primary shadow-2xl">
            {t("getQuote")}
          </WipeButton>
          <WipeButton href="mailto:contact@vietdragon.vn" tone="outline" size="lg" arrow={false}>
            {tContact("email")}
          </WipeButton>
        </motion.div>

        {/* Contact details */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <span className="flex items-center gap-2">
            <IconBadge icon={Phone} size="sm" className="bg-white/15" />
            {tContact("phone1")} · {tContact("phone2")}
          </span>
          <span className="hidden sm:block">·</span>
          <span className="flex items-center gap-2">
            <IconBadge icon={Mail} size="sm" className="bg-white/15" />
            {tContact("email")}
          </span>
          <span className="hidden sm:block">·</span>
          <span className="flex items-center gap-2">
            <IconBadge icon={MapPin} size="sm" className="bg-white/15" />
            {tContact("address")}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
