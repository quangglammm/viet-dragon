"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Library, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

/**
 * Floating button that opens a static legend of every icon used across
 * `ProductOption.descriptionTraits` (see data/material-traits.ts) — lets a
 * customer revisit what a material-flashcard icon meant without re-reading
 * every flashcard. Self-contained: drop it into any page, no props needed.
 */
export function MaterialGlossaryFab() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("materialGlossary");
  const locale = useLocale() as Locale;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 left-3 z-30 flex flex-col items-start gap-3 sm:bottom-8 sm:left-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[min(88vw,320px)] rounded-2xl border border-zinc-100 bg-white shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
                <h3 className="font-black text-zinc-900 text-sm">{t("title")}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeLabel")}
                  className="shrink-0 inline-flex items-center justify-center size-7 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-white transition-colors"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-100">
                {Object.entries(materialTraits).map(([key, trait]) => {
                  const Icon = trait.icon;
                  return (
                    <li key={key} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-brand-soft text-brand-primary">
                        <Icon size={15} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 text-sm">
                          {pickLocale(locale, trait.labelVi, trait.label)}
                        </p>
                        <p className="text-zinc-500 text-xs leading-relaxed mt-0.5">
                          {pickLocale(locale, trait.descriptionVi, trait.description)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t("closeLabel") : t("openLabel")}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.35, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark shadow-lg shadow-brand-dark/25 sm:h-14 sm:w-14"
        >
          <Library className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} />
        </motion.button>
      </div>
    </>
  );
}
