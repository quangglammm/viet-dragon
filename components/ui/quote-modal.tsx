"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PHONE_NUMBER,
  PHONE_NUMBER_FORMATTED,
  PHONE_NUMBER_2,
  PHONE_NUMBER_2_FORMATTED,
  ZALO_CHAT_URL,
} from "@/lib/contact";
import { ZaloIcon } from "@/components/ui/zalo-icon";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

export function QuoteModal({
  isOpen,
  onClose,
  productName,
}: Readonly<QuoteModalProps>) {
  const t = useTranslations("quoteModal");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState(productName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/[\s.-]/g, "");

    if (!cleanPhone) {
      setError(t("phoneError"));
      return;
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError(t("phoneError"));
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const itemDescription = note.trim() || productName || "Yêu cầu báo giá nhanh";

        const res = await fetch("/api/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanPhone,
            productName: itemDescription,
            productUrl: typeof window !== "undefined" ? window.location.href : "",
          }),
        });

        if (!res.ok) {
          setError(t("phoneError"));
          return;
        }

        setIsSuccess(true);
      } catch (err) {
        console.error("Quote submit error:", err);
        setError(t("phoneError"));
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-brand-dark/75 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Centering and scroll wrapper with safe bottom space on mobile */}
          <div
            className="relative min-h-full flex items-center justify-center p-4 pt-6 pb-14 sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            {/* Modal Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quote-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 overflow-hidden border border-zinc-100 my-auto text-left"
            >
              {/* Top gradient highlight line */}
              <div className="h-1.5 w-full bg-gradient-brand" />

              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label={t("close")}
                className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              <div className="p-5 sm:p-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src="/logo-icon.webp"
                      alt="Viet Dragon - In Ấn Chuyên Nghiệp"
                      width={36}
                      height={28}
                      className="h-8 w-auto object-contain shrink-0"
                    />
                    <div className="inline-flex items-center gap-1.5 eyebrow-pill px-3 py-1">
                      <Sparkles size={12} className="text-brand-primary" />
                      <span className="eyebrow-pill-text text-[11px] font-bold">
                        {t("eyebrow")}
                      </span>
                    </div>
                  </div>
                  <h3
                    id="quote-modal-title"
                    className="text-2xl sm:text-3xl font-black text-brand-dark leading-tight tracking-tight"
                  >
                    {t("title")}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                    {t("subtitle")}
                  </p>
                </div>

                {/* Direct Call / Zalo Contact Cards (Gắn số điện thoại trực tiếp) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  {/* Hotline Call Button */}
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-brand-soft border border-brand-primary/20 hover:border-brand-primary hover:bg-[#ebeeff] hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative flex items-center justify-center size-11 rounded-xl bg-brand-primary text-white shrink-0 group-hover:scale-105 transition-transform">
                      <span className="absolute inset-0 rounded-xl bg-brand-primary animate-ping opacity-25" />
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        {t("hotlineTitle")}
                      </p>
                      <p className="text-sm font-black text-brand-primary group-hover:text-brand-dark transition-colors tracking-tight">
                        {PHONE_NUMBER_FORMATTED}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {t("hotlineAction")} · 24/7
                      </p>
                    </div>
                  </a>

                  {/* Zalo Chat Button */}
                  <a
                    href={ZALO_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3.5 rounded-2xl bg-[#0068ff]/5 border border-[#0068ff]/20 hover:border-[#0068ff] hover:bg-[#0068ff]/10 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-center size-11 rounded-xl bg-[#0068ff] text-white shrink-0 group-hover:scale-105 transition-transform">
                      <ZaloIcon className="size-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        {t("zaloTitle")}
                      </p>
                      <p className="text-sm font-black text-[#0068ff] tracking-tight">
                        {PHONE_NUMBER_FORMATTED}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {t("zaloSub")}
                      </p>
                    </div>
                  </a>
                </div>

                {/* Secondary Hotline badge for quick reference */}
                <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 text-xs text-zinc-500 bg-zinc-50 py-1.5 px-3 rounded-full border border-zinc-150">
                  <Phone size={12} className="text-brand-primary" />
                  <span>{t("hotline2")}</span>
                  <a
                    href={`tel:${PHONE_NUMBER_2}`}
                    className="font-bold text-zinc-700 hover:text-brand-primary transition-colors"
                  >
                    {PHONE_NUMBER_2_FORMATTED}
                  </a>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-4 sm:mb-6">
                  <div className="border-t border-zinc-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    {t("orDivider")}
                  </span>
                  <div className="border-t border-zinc-200 w-full" />
                </div>

              {/* Form or Success State */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 flex flex-col items-center text-center gap-3"
                >
                  <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-lg font-black text-brand-dark">
                    {t("successTitle")}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 max-w-sm leading-relaxed">
                    {t("successDesc")}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 w-full">
                    <a
                      href={ZALO_CHAT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0068ff] hover:bg-[#0057d6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <ZaloIcon className="size-4 shrink-0" />
                      <span>{t("openZaloNow")}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors"
                    >
                      {t("close")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Phone input */}
                  <div>
                    <label
                      htmlFor="quote-modal-phone"
                      className="block text-xs font-bold text-zinc-700 mb-1.5"
                    >
                      {t("phoneLabel")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Phone size={15} />
                      </div>
                      <input
                        id="quote-modal-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder={t("phonePlaceholder")}
                        disabled={isPending}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Note / Product input */}
                  <div>
                    <label
                      htmlFor="quote-modal-note"
                      className="block text-xs font-bold text-zinc-700 mb-1.5"
                    >
                      {t("noteLabel")}
                    </label>
                    <input
                      id="quote-modal-note"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("notePlaceholder")}
                      disabled={isPending}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-1 py-3.5 px-6 rounded-xl bg-brand-primary hover:bg-[#5b00cf] text-white font-bold text-xs uppercase tracking-wider btn-wipe shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t("submitting")}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{t("submit")}</span>
                        <span aria-hidden>→</span>
                      </>
                    )}
                  </button>

                  {/* Trust badges */}
                  <div className="pt-2.5 pb-2 sm:pb-1 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-brand-primary shrink-0" />
                      {t("trust1")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={12} className="text-brand-primary shrink-0" />
                      {t("trust2")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-brand-primary shrink-0" />
                      {t("trust3")}
                    </span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
}
