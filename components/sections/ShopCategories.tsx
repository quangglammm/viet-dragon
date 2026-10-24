"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSiteData } from "@/components/providers/site-data-provider";

export default function ShopCategories() {
  const t = useTranslations("shopCategories");
  const { categories } = useSiteData();

  return (
    <section className="relative w-full bg-white py-10 lg:py-12 border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => {
            const count = cat.cards.length;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <Link href={cat.href} className="group flex flex-col items-center text-center gap-4">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden ring-1 ring-zinc-100 group-hover:ring-brand-primary/40 transition-all">
                    {cat.cover && (
                      <Image
                        src={cat.cover}
                        alt={cat.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-zinc-900 text-sm group-hover:text-brand-primary transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-zinc-400 text-xs mt-0.5">{t("itemCount", { count })}</p>
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
