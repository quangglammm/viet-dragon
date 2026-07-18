"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { CheckCircle2, Phone, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { WipeButton } from "@/components/ui/wipe-button";
import { useSectionInView } from "@/hooks/use-section-in-view";

export default function About() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("about");
  const tContact = useTranslations("contact");
  const checklist = t.raw("checklist") as string[];

  return (
    <section id="about" className="relative w-full bg-white overflow-hidden py-14 lg:py-20">
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
      >
        {/* Image + floating stat card */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="relative h-[360px] sm:h-[440px] lg:h-[520px] rounded-2xl overflow-hidden">
            <Image
              src="/images/about/vdabout.jpg"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <motion.div
            className="absolute -bottom-6 -right-4 sm:right-6 flex items-center gap-4 bg-white rounded-2xl shadow-xl p-5 max-w-[240px]"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <IconBadge icon={Award} size="lg" />
            <div>
              <p className="text-2xl font-black text-zinc-900 leading-none">{t("statNumber")}</p>
              <p className="text-zinc-400 text-xs mt-1">{t("statLabel")}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <div>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            className="mb-3"
            titleClassName="text-3xl sm:text-4xl lg:text-5xl mb-3"
          />

          <motion.p
            className="text-zinc-500 text-base leading-relaxed mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {t("body")}
          </motion.p>

          {/* Checklist */}
          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-brand-primary shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-700 font-medium leading-snug">{item}</span>
              </li>
            ))}
          </motion.ul>

          {/* Discover more + call an expert */}
          <motion.div
            className="flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <WipeButton href="/products" tone="primary" size="md">
              {t("discoverMore")}
            </WipeButton>

            <a href="tel:0901448377" className="inline-flex items-center gap-3">
              <IconBadge icon={Phone} size="md" />
              <span>
                <span className="block text-zinc-400 text-xs">{t("callExpert")}</span>
                <span className="block text-zinc-900 font-bold">{tContact("phone1")}</span>
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
