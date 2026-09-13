"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("faq");
  const faqs = t.raw("items") as FaqItem[];
  const [activeItem, setActiveItem] = useState<string>("faq-0");

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
            <Accordion
              type="single"
              collapsible
              value={activeItem}
              onValueChange={setActiveItem}
            >
              {faqs.map((item, i) => {
                const itemValue = `faq-${i}`;
                const isOpen = activeItem === itemValue;
                const hasActive = Boolean(activeItem);

                return (
                  <AccordionItem
                    key={item.q}
                    value={itemValue}
                    className={cn(
                      "transition-opacity duration-300",
                      hasActive && !isOpen ? "opacity-80" : "opacity-100"
                    )}
                    style={{ opacity: hasActive && !isOpen ? 0.8 : 1 }}
                  >
                    <AccordionTrigger className={isOpen ? "text-brand-primary" : "text-zinc-900"}>
                      <span
                        className={cn(
                          "transition-colors duration-200",
                          isOpen ? "text-brand-primary font-bold" : "text-zinc-900 font-bold"
                        )}
                        style={{ color: isOpen ? "var(--brand-primary)" : undefined }}
                      >
                        {i + 1}. {item.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
