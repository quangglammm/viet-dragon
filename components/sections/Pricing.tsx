"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { cn } from "@/lib/utils";

const highlights = [false, true, false];

type Plan = { name: string; desc: string; features: string[] };

export default function Pricing() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("pricing");
  const plans = (t.raw("plans") as Plan[]).map((p, i) => ({ ...p, highlighted: highlights[i] }));

  return (
    <section id="pricing" className="relative w-full bg-white overflow-hidden py-20 lg:py-[120px]">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          className="text-center mb-14"
        />

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl p-8",
                plan.highlighted
                  ? "bg-brand-primary text-white shadow-2xl lg:-translate-y-4"
                  : "bg-brand-soft text-zinc-900"
              )}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: plan.highlighted ? -16 : 0 } : {}}
              whileHover={{ y: (plan.highlighted ? -16 : 0) - 10 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: "easeInOut" }}
            >
              <p className={cn("text-xs font-semibold tracking-widest uppercase mb-2", plan.highlighted ? "text-white/80" : "text-brand-primary")}>
                {plan.name}
              </p>
              <p className={cn("text-sm mb-6", plan.highlighted ? "text-white/60" : "text-zinc-500")}>
                {plan.desc}
              </p>
              <p className={cn("text-3xl font-black mb-8", plan.highlighted ? "text-white" : "text-zinc-900")}>
                {t("priceLabel")}
              </p>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className={cn("shrink-0 mt-0.5", plan.highlighted ? "text-white" : "text-brand-primary")} />
                    <span className={cn("text-sm leading-snug", plan.highlighted ? "text-white/80" : "text-zinc-600")}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/#cta"
                className={cn(
                  "btn-wipe inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-center",
                  plan.highlighted ? "bg-white text-brand-primary" : "bg-zinc-900 text-white"
                )}
              >
                {t("cta")}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
