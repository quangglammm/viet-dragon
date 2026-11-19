"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useDragControls } from "motion/react";
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
import { cleanPhone, isPhoneNumber } from "@/lib/phone";
import { trackEvent } from "@/lib/analytics";
import { HoneypotField } from "@/components/ui/honeypot-field";
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

export function QuoteModal({
  isOpen,
  onClose,
  productName,
}: Readonly<QuoteModalProps>) {
  const t = useTranslations("quoteModal");
  const [phone, setPhone] = useState("");
  const [trap, setTrap] = useState("");
  const [note, setNote] = useState(productName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      const initial = productName ?? "";
      const lines = initial.split(/\r?\n/);
      setNote(lines.length > 2 ? lines.slice(0, 2).join("\n") : initial);
    }
  }, [isOpen, productName]);

  const handleClose = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const number = cleanPhone(phone);

    if (!number) {
      setError(t("phoneError"));
      return;
    }

    if (!isPhoneNumber(number)) {
      setError(t("phoneError"));
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const itemDescription = note.trim() || productName || t("modalTitle");

        const res = await fetch("/api/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: number,
            website: trap,
            productName: itemDescription,
            productUrl: typeof window !== "undefined" ? window.location.href : "",
          }),
        });

        if (!res.ok) {
          setError(res.status === 429 ? t("tooManyRequests") : t("phoneError"));
          return;
        }

        trackEvent("generate_lead", {
          event_category: "Consultation",
          event_label: itemDescription,
          form_name: "quote_modal",
        });

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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
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

          {/* Bottom Sheet Card on Mobile / Centered Modal on Desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-modal-title"
            drag="y"
            dragDirectionLock
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 250 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                handleClose();
              }
            }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden border border-zinc-100 max-h-[90dvh] sm:max-h-[calc(100vh-3rem)] flex flex-col text-left"
          >
            {/* Top gradient highlight line */}
            <div className="h-1 sm:h-1.5 w-full bg-gradient-brand shrink-0" />

            {/* Drag Handle Bar on Mobile */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="sm:hidden w-full flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
            >
              <div className="w-10 h-1.5 rounded-full bg-zinc-300" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("close")}
              className="absolute top-2.5 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer z-20"
            >
              <X size={18} />
            </button>

            {/* Inner scroll container with safe area padding */}
            <div className="p-4 sm:p-7 overflow-y-auto flex-1 flex flex-col pb-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))]">
              {/* Header */}
              <div className="mb-3 sm:mb-5 pr-8 sm:pr-0">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Image
                    src="/logo-icon.webp"
                    alt="Viet Dragon - In Ấn Chuyên Nghiệp"
                    width={36}
                    height={28}
                    className="h-6 sm:h-8 w-auto object-contain shrink-0"
                  />
                  <div className="inline-flex items-center gap-1.5 eyebrow-pill px-2.5 sm:px-3 py-0.5 sm:py-1">
                    <Sparkles size={11} className="text-brand-primary" />
                    <span className="eyebrow-pill-text text-[10px] sm:text-[11px] font-bold">
                      {t("eyebrow")}
                    </span>
                  </div>
                </div>
                <h3
                  id="quote-modal-title"
                  className="text-xl sm:text-2xl font-black text-brand-dark leading-tight tracking-tight"
                >
                  {t("title")}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug sm:leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Form or Success State */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 flex flex-col items-center text-center gap-3 my-auto"
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
                <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
                  <HoneypotField value={trap} onChange={setTrap} />

                  {/* Phone input */}
                  <div>
                    <label
                      htmlFor="quote-modal-phone"
                      className="block text-xs font-bold text-zinc-700 mb-1"
                    >
                      {t("phoneLabel")} <span className="text-red-500">*</span>
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
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                      />
                    </div>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Note / Product input */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <label
                        htmlFor="quote-modal-note"
                        className="block text-xs font-bold text-zinc-700 shrink-0"
                      >
                        {t("noteLabel")}
                      </label>
                      {Boolean(productName) && (
                        <button
                          type="button"
                          onClick={() =>
                            setNote((prev) =>
                              prev === productName ? "" : (productName ?? "")
                            )
                          }
                          title={productName}
                          className="text-[11px] sm:text-xs text-brand-primary font-medium hover:text-[#5b00cf] hover:underline transition-colors cursor-pointer text-right line-clamp-2"
                        >
                          {t("interestedInThisProduct")}
                        </button>
                      )}
                    </div>
                    <textarea
                      id="quote-modal-note"
                      rows={2}
                      value={note}
                      onChange={(e) => {
                        const val = e.target.value;
                        const lines = val.split("\n");
                        if (lines.length > 2) {
                          setNote(lines.slice(0, 2).join("\n"));
                        } else {
                          setNote(val);
                        }
                      }}
                      placeholder={t("notePlaceholder")}
                      disabled={isPending}
                      className="w-full px-3.5 py-2 sm:py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:bg-white focus:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all resize-none leading-relaxed max-h-[4.25rem] sm:max-h-[4.5rem] overflow-y-auto"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-0.5 py-3 sm:py-3.5 px-6 rounded-xl bg-brand-primary hover:bg-[#5b00cf] text-white font-bold text-xs uppercase tracking-wider btn-wipe shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
                  <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-medium">
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

                  {/* Compact direct contact at the foot of the form */}
                  <div className="mt-1 pt-2.5 border-t border-dashed border-zinc-200 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                        {t("orDivider")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Hotline Button */}
                      <a
                        href={`tel:${PHONE_NUMBER_2}`}
                        className="group flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-soft border border-brand-primary/20 hover:border-brand-primary hover:bg-[#ebeeff] transition-all text-left"
                      >
                        <div className="size-6 rounded-md bg-brand-primary text-white flex items-center justify-center shrink-0">
                          <Phone size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase leading-none truncate">
                            {t("hotlineTitle")}
                          </p>
                          <p className="text-[11px] font-black text-brand-primary tracking-tight truncate">
                            {PHONE_NUMBER_2_FORMATTED}
                          </p>
                        </div>
                      </a>

                      {/* Zalo Button */}
                      <a
                        href={ZALO_CHAT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0068ff]/5 border border-[#0068ff]/20 hover:border-[#0068ff] hover:bg-[#0068ff]/10 transition-all text-left"
                      >
                        <div className="size-6 rounded-md bg-[#0068ff] text-white flex items-center justify-center shrink-0">
                          <ZaloIcon className="size-3.5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-zinc-400 uppercase leading-none truncate">
                            {t("zaloTitle")}
                          </p>
                          <p className="text-[11px] font-black text-[#0068ff] tracking-tight truncate">
                            {PHONE_NUMBER_FORMATTED}
                          </p>
                        </div>
                      </a>
                    </div>

                    {/* Secondary Hotline compact line */}
                    <p className="text-center text-[10px] text-zinc-400">
                      {t("hotline2")}{" "}
                      <a
                        href={`tel:${PHONE_NUMBER}`}
                        className="font-bold text-zinc-600 hover:text-brand-primary transition-colors"
                      >
                        {PHONE_NUMBER_FORMATTED}
                      </a>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
