"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { ZALO_CHAT_URL } from "@/lib/contact";
import { ZaloIcon } from "@/components/ui/zalo-icon";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

interface ConsultBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  materialName?: string;
  sizeLabel?: string;
  sizeDims?: string;
  locale?: Locale;
}

const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

export function ConsultBottomSheet({
  isOpen,
  onClose,
  productName,
  materialName,
  sizeLabel,
  sizeDims,
  locale: propLocale,
}: Readonly<ConsultBottomSheetProps>) {
  const t = useTranslations("consultModal");
  const ctxLocale = useLocale() as Locale;
  const locale = propLocale ?? ctxLocale;

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dragControls = useDragControls();

  const handleClose = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  // Lock body scroll and listen for Escape key when modal is open
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
      setError(t("errorRequired"));
      return;
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError(t("errorInvalid"));
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        // Copy consultation message to clipboard for customer convenience
        const quoteMessage = pickLocale(
          locale,
          `Cảm ơn anh/chị đã quan tâm đến sản phẩm ${productName}. Vietdragon rất mong muốn được liên hệ để tư vấn chi tiết hơn về mong đợi, chất liệu, giá thành và kích thước phù hợp nhất cho nhu cầu của mình ạ!`,
          `Thank you for your interest in ${productName}. Viet Dragon would love to connect and consult on your expectations, materials, pricing, and optimal dimensions!`,
          `感谢您对 ${productName} 的关注。Viet Dragon 专员期待与您沟通，为您提供关于材质、规格与报价的详细咨询建议！`,
          `${productName} にご関心をお寄せいただきありがとうございます。Viet Dragon 専門スタッフが、ご希望の仕様や素材、お見積もりについて詳しくご案内いたします！`,
          `${productName} 제품에 관심을 가져주셔서 감사합니다. Viet Dragon 전문 상담원이 최적의 규격, 소재 및 맞춤 견적을 상세히 안내해 드리겠습니다!`
        );
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(quoteMessage);
          } catch {
            // Ignore clipboard errors if not allowed
          }
        }

        // Send consultation data to server (which notifies contact@vietdragon.vn)
        const res = await fetch("/api/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanPhone,
            productName,
            materialName,
            sizeLabel,
            sizeDims,
            productUrl: typeof window !== "undefined" ? window.location.href : "",
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? t("errorGeneric"));
          return;
        }

        setIsSuccess(true);

        // Open Viet Dragon Zalo chat directly for immediate interaction
        window.open(ZALO_CHAT_URL, "_blank", "noopener,noreferrer");

        // Automatically close the bottom sheet after 1.8s
        window.setTimeout(() => {
          onClose();
          setPhone("");
          setIsSuccess(false);
        }, 1800);
      } catch (err) {
        console.error("Consult submission error:", err);
        setError(t("errorGeneric"));
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal / Bottom Sheet Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-modal-title"
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
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle Bar on Mobile */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="sm:hidden w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0068ff]">
                  <ZaloIcon className="size-5" />
                </div>
                <h3 id="consult-modal-title" className="text-base font-black text-zinc-900">
                  {t("title")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="size-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              {/* Product summary pill */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-150 flex flex-col gap-1.5 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {productName}
                </span>
                {(materialName || sizeLabel) && (
                  <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-zinc-700">
                    {materialName && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200">
                        {materialName}
                      </span>
                    )}
                    {sizeLabel && (
                      <span>
                        {sizeLabel}
                        {sizeDims && !sizeLabel.includes(sizeDims) ? ` (${sizeDims})` : ""}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-zinc-500 mt-2 font-medium">
                  {t("title")}
                </p>
              </div>

              {/* Form */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center text-center gap-3"
                >
                  <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={28} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-base font-bold text-zinc-900">
                    {t("successTitle")}
                  </h4>
                  <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
                    {t("successDesc")}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="consult-phone-input"
                      className="text-xs font-bold text-zinc-700 text-left"
                    >
                      {t("phoneLabel")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                        <Phone size={16} />
                      </div>
                      <input
                        id="consult-phone-input"
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
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0068ff]/40 focus:border-[#0068ff] transition-all"
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

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-1 py-3.5 px-6 rounded-xl bg-[#0068ff] hover:bg-[#0057d6] text-white font-bold text-sm shadow-md shadow-[#0068ff]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t("submittingBtn")}</span>
                      </>
                    ) : (
                      <>
                        <ZaloIcon className="size-5 shrink-0" />
                        <span>{t("submitBtn")}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-400 text-center leading-relaxed px-2 pt-1">
                    {t("privacyNote")}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
