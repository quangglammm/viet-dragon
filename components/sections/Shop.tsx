"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Eye, MessageSquareText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSiteData } from "@/components/providers/site-data-provider";
import { cn } from "@/lib/utils";

export default function Shop() {
  const [active, setActive] = useState(0);
  const { categories } = useSiteData();
  const cat = categories[active] ?? categories[0];
  const t = useTranslations("shop");
  if (!cat) return null;

  return (
    <section id="products" className="relative w-full bg-white py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          className="text-center mb-10"
        />

        {/* Tab nav */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
                active === i
                  ? "bg-brand-primary text-white"
                  : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={cat.id}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {cat.cards.map((item, idx) => {
              const itemName = item.title;
              const productHref = item.href;
              return (
                <div key={item.id} className="group flex flex-col">
                  <div className="relative h-56 rounded-2xl overflow-hidden bg-zinc-100">
                    <Link href={productHref} className="block w-full h-full relative">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={itemName}
                          fill
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          priority={idx < 4}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </Link>
                    {/* Hover overlay actions */}
                    <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/30 transition-colors duration-300 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                      <Link
                        href={productHref}
                        aria-label={t("viewDetail")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-700 hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={productHref}
                        aria-label={t("requestQuote")}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-700 hover:bg-brand-primary hover:text-white transition-colors"
                      >
                        <MessageSquareText size={16} />
                      </Link>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-black text-zinc-900 text-sm">
                      <Link href={productHref} className="hover:text-brand-primary transition-colors">
                        {itemName}
                      </Link>
                    </h3>
                    <Link href={productHref} className="inline-block mt-2 text-brand-primary text-xs font-semibold hover:opacity-80 transition-opacity">
                      {t("requestQuoteArrow")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
