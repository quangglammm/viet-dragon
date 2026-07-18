"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WipeButton } from "@/components/ui/wipe-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSectionInView } from "@/hooks/use-section-in-view";

// Matches the reference template's asymmetric project grid:
// left column (tall top + 2 small below) | wide center | right column (2 stacked)
const seeds = ["pf1", "pf2", "pf3", "pf4", "pf5", "pf6"];
const slots = ["left-top", "left-bottom", "left-bottom", "center", "right", "right"] as const;

type PortfolioItem = { label: string; cat: string; seed: string };

function Tile({
  item,
  className,
}: {
  item: PortfolioItem;
  className?: string;
}) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden ${className ?? ""}`}>
      <Image
        src={`/images/portfolio/${item.seed}.jpeg`}
        alt={item.label}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-start gap-1.5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="max-w-[170px] bg-brand-primary text-white font-black text-sm leading-snug px-3 py-1.5 rounded-md">
          {item.label}
        </p>
        <p className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{item.cat}</p>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { ref, inView } = useSectionInView();
  const t = useTranslations("portfolio");
  const copy = t.raw("items") as PortfolioItem[];
  const items = copy.map((c, i) => ({ ...c, seed: seeds[i], slot: slots[i] }));

  const [t1, t2, t3, t4, t5, t6] = items;

  return (
    <section
      className="relative w-full bg-brand-soft overflow-hidden py-14 lg:py-20"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titleLine1")}{" "}
                <span className="text-brand-primary">{t("titleHighlight")}</span>
              </>
            }
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="self-start"
          >
            <WipeButton href="/products" tone="primary" size="md" className="whitespace-nowrap">
              {t("viewAll")}
            </WipeButton>
          </motion.div>
        </div>

        {/* Mobile/tablet: simple 2×3 grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.seed}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Tile item={item} className="h-40" />
            </motion.div>
          ))}
        </div>

        {/* Desktop: asymmetric 3 / 6 / 3 column mosaic */}
        <motion.div
          className="hidden lg:grid grid-cols-12 gap-4 h-[560px]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Left: tall top + 2 small below */}
          <div className="col-span-3 flex flex-col gap-4 h-full">
            <Tile item={t1} className="flex-[3]" />
            <div className="flex-[2] grid grid-cols-2 gap-4">
              <Tile item={t2} />
              <Tile item={t3} />
            </div>
          </div>

          {/* Center: single large tile */}
          <Tile item={t4} className="col-span-6 h-full" />

          {/* Right: 2 stacked */}
          <div className="col-span-3 flex flex-col gap-4 h-full">
            <Tile item={t5} className="flex-1" />
            <Tile item={t6} className="flex-1" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
