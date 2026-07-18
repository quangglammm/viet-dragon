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
    <section className="relative w-full bg-white py-10 lg:py-12 border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {productCategories.map((cat, i) => {
            const name = pickLocale(locale, cat.nameVi, cat.nameEn);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <Link href={`/products/${cat.id}`} className="group flex flex-col items-center text-center gap-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden ring-1 ring-zinc-100 group-hover:ring-brand-primary/40 transition-all">
                    <Image
                      src={cat.coverImage}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
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
