"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { useSectionInView } from "@/hooks/use-section-in-view";

const seeds = ["vd-svc-consult", "vd-svc-design", "vd-svc-sample", "vd-svc-delivery"];

type ServiceItem = { title: string; desc: string };

export default function Services() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section
      id="services"
      className="relative w-full bg-brand-soft flex items-center overflow-hidden py-14 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          className="text-center mb-12"
        />

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((s, i) => (
            <motion.div
              key={s.title}
              className="group flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative w-full sm:w-32 h-40 sm:h-auto shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={`/images/service/${seeds[i]}.jpg`}
                  alt={s.title}
                  fill
                  sizes="(min-width: 640px) 128px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-2 py-1">
                <div>
                  <p className="font-black text-zinc-900 text-lg">{s.title}</p>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed flex-1">{s.desc}</p>
                <Link
                  href="/#cta"
                  className="inline-flex items-center gap-2 text-brand-primary text-xs font-semibold mt-1"
                >
                  <span className="relative">
                    {t("cta")}
                    <span className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 bg-brand-primary transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <IconBadge
                    icon={ArrowRight}
                    size="sm"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
