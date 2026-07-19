"use client";

import { Phone } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

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

  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col items-center gap-3 sm:bottom-8 sm:right-6">
      <motion.a
        href={`https://zalo.me/${ZALO_PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("zalo")}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.35, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0068ff] shadow-lg shadow-[#0068ff]/35"
      >
        <ZaloIcon className="h-8 w-8" />
      </motion.a>

      <motion.a
        href={`tel:${PHONE_NUMBER}`}
        aria-label={t("call")}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.75, duration: 0.35, ease: "easeOut" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary shadow-lg shadow-brand-primary/35"
      >
        <span className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-40" />
        <Phone className="relative h-6 w-6 text-white" strokeWidth={2.25} />
      </motion.a>
    </div>
  );
}
