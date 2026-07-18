"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSectionInView } from "@/hooks/use-section-in-view";

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("faq");
  const faqs = t.raw("items") as FaqItem[];

  return (
    <section id="faq" className="relative w-full bg-white overflow-hidden py-14 lg:py-20">
      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <motion.div
          className="relative hidden lg:block h-[440px] rounded-2xl overflow-hidden order-2"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/images/faq/vdfaq.jpg"
            alt="Viet Dragon"
            fill
            sizes="50vw"
            className="object-cover"
          />
        </motion.div>

        {/* Accordion */}
        <div className="order-1">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}{" "}
                <span className="text-brand-primary">{t("titleHighlight")}</span>
              </>
            }
            className="mb-8"
            titleClassName="text-3xl sm:text-4xl lg:text-5xl mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible defaultValue="faq-0">
              {faqs.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`}>
                  <AccordionTrigger>
                    <span>{i + 1}. {item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
