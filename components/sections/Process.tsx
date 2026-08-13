"use client";

import { motion } from "motion/react";
import { MessageCircle, PenTool, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { WipeButton } from "@/components/ui/wipe-button";
import { IconBadge } from "@/components/ui/icon-badge";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { useHashPulse } from "@/hooks/use-hash-pulse";

const icons = [MessageCircle, PenTool, Truck];

type Step = { title: string; desc: string };

export default function Process() {
  const { ref, inView } = useSectionInView();
  const { ref: titleRef, pulse } = useHashPulse<HTMLHeadingElement>();
  const t = useTranslations("process");
  const steps = (t.raw("steps") as Step[]).map((s, i) => ({ ...s, icon: icons[i] }));

  return (
    <section id="process" className="relative w-full bg-white overflow-hidden py-14 lg:py-20">
      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-5 items-center">
          {/* Intro column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h2 ref={titleRef} className="text-3xl font-black text-zinc-900 leading-tight mb-2">
              <motion.span
                animate={pulse ? { scale: [1, 1.05, 1], color: ["inherit", "var(--brand-primary)", "inherit"] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block origin-left"
              >
                {t("titleLine1")}{" "}
                <span className="text-brand-primary">{t("titleHighlight")}</span>
              </motion.span>
            </h2>
            <p className="text-zinc-500 text-sm mb-6">
              {t("subtitle")}
            </p>
            <WipeButton href="/#cta" tone="primary" size="md">
              {t("cta")}
            </WipeButton>
          </motion.div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="relative flex flex-col gap-4 p-6 bg-brand-soft rounded-2xl h-full"
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="absolute top-5 right-5 text-3xl font-black text-brand-primary/10">
                  0{i + 1}
                </span>
                <IconBadge icon={Icon} size="lg" rounded="xl" strokeWidth={1.75} />
                <div>
                  <p className="font-black text-zinc-900 text-lg">{step.title}</p>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
