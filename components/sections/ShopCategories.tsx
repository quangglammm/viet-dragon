"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";

export default function ShopCategories() {
  const t = useTranslations("shopCategories");
  const locale = useLocale() as Locale;

  return (
    <section className="relative w-full bg-white py-12 lg:py-16 border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-2 lg:pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {productCategories.map((cat, i) => {
            const name = pickLocale(locale, cat.nameVi, cat.nameEn);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 w-40 sm:w-48 lg:w-auto snap-start"
              >
                <Link href={`/products/${cat.id}`} className="group flex flex-col items-center text-center gap-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden ring-1 ring-zinc-100 group-hover:ring-brand-primary/40 transition-all">
                    <Image
                      src={cat.coverImage}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-black text-zinc-900 text-sm group-hover:text-brand-primary transition-colors">
                      {name}
                    </p>
                    <p className="text-zinc-400 text-xs mt-0.5">{t("itemCount", { count: cat.items.length })}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
