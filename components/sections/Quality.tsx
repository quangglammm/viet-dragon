"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { WipeButton } from "@/components/ui/wipe-button";
import { useSectionInView } from "@/hooks/use-section-in-view";

export default function Quality() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("quality");
  const checklist = t.raw("checklist") as string[];

  return (
    <section
      id="quality"
      className="relative w-full bg-brand-soft overflow-hidden py-20 lg:py-[120px]"
    >
      <div
        ref={ref}
        className="relative max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Template: large product photo on one side, content split on the other
            (a light two-column feature block, not a full-bleed dark overlay banner). */}
        <motion.div
          className="relative h-[320px] lg:h-[480px] rounded-2xl overflow-hidden order-2 lg:order-1"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="https://picsum.photos/seed/vdquality/900/1000"
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </motion.div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}{" "}
                <span className="text-brand-primary">{t("titleHighlight")}</span>
              </>
            }
            description={t("subtitle")}
            className="mb-4"
            titleClassName="text-3xl sm:text-4xl lg:text-5xl mb-4"
          />

          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10 mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <IconBadge icon={Check} size="sm" strokeWidth={3} />
                <span className="text-zinc-700 text-sm font-medium">{item}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <WipeButton href="/#cta" tone="primary" size="lg">
              {t("cta")}
            </WipeButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
