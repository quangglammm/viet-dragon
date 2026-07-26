"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { pickLocale } from "@/lib/locale";

const PHONE_NUMBER = "0901448377";
const ZALO_PHONE = "84901448377"; // zalo.me phone-chat links use country code, no leading 0

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="19"
        fontWeight="800"
        fontFamily="var(--font-sans), Arial, sans-serif"
        fill="white"
      >
        Zalo
      </text>
    </svg>
  );
}

export function FloatingContact() {
  const t = useTranslations("floatingContact");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Zalo chat links can't carry a prefilled message (no wa.me-style `?text=`),
  // so on a product page we copy an inquiry message to the clipboard instead —
  // the admin still learns which product the visitor wants to consult about.
  const activeProductName = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] !== "products" || segments.length !== 3) return null;
    const [, categoryId, productId] = segments;
    const category = productCategories.find((c) => c.id === categoryId);
    const product = category?.items.find((item) => item.id === productId);
    if (!product) return null;
    return pickLocale(locale, product.nameVi, product.nameEn);
  }, [pathname, locale]);

  const handleZaloClick = () => {
    if (!activeProductName) return;
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    if (!clipboard) return;

    const message = t("productInquiryMessage", {
      product: activeProductName,
      url: window.location.href,
    });

    clipboard
      .writeText(message)
      .then(() => {
        setShowCopiedToast(true);
        window.setTimeout(() => setShowCopiedToast(false), 3000);
      })
      .catch(() => {});
  };

  return (
    <div className="fixed bottom-4 right-3 z-30 flex flex-col items-center gap-2 sm:bottom-8 sm:right-6 sm:gap-3">
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="status"
            className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-brand-dark px-3 py-2 text-xs leading-snug text-white shadow-lg sm:w-56"
          >
            {t("copiedToast")}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://zalo.me/${ZALO_PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("zalo")}
        onClick={handleZaloClick}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.35, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0068ff] shadow-lg shadow-[#0068ff]/35 sm:h-14 sm:w-14 sm:rounded-2xl"
      >
        <ZaloIcon className="h-6 w-6 sm:h-8 sm:w-8" />
      </motion.a>

      <motion.a
        href={`tel:${PHONE_NUMBER}`}
        aria-label={t("call")}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.75, duration: 0.35, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary shadow-lg shadow-brand-primary/35 sm:h-14 sm:w-14"
      >
        <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-40" />
        <Phone className="relative h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.25} />
      </motion.a>
    </div>
  );
}
