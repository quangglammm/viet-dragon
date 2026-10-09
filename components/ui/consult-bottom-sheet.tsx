"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ZALO_CHAT_URL } from "@/lib/contact";
import { ZaloIcon } from "@/components/ui/zalo-icon";

interface ConsultBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  materialName?: string;
  sizeLabel?: string;
  sizeDims?: string;
}

const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

export function ConsultBottomSheet({
  isOpen,
  onClose,
  productName,
  materialName,
  sizeLabel,
  sizeDims,
}: Readonly<ConsultBottomSheetProps>) {
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
      setError("Vui lòng nhập số điện thoại của bạn.");
      return;
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError("Số điện thoại không đúng định dạng (ví dụ: 0901234567).");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        // Copy consultation message to clipboard for customer convenience
        const quoteMessage = `Cảm ơn anh/chị đã quan tâm đến sản phẩm ${productName}. Vietdragon rất mong muốn được liên hệ để tư vấn chi tiết hơn về mong đợi, chất liệu, giá thành và kích thước phù hợp nhất cho nhu cầu của mình ạ!`;
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
          setError(data.error ?? "Không thể gửi yêu cầu. Vui lòng thử lại.");
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
        setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
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

          {/* Bottom Sheet Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-sheet-title"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) {
                handleClose();
              }
            }}
            className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden"
          >
            {/* Top Bar: Drag Handle (Mobile visual cue & touch gesture handle) + Close Button */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="relative pt-3.5 pb-1 px-6 sm:px-7 shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-zinc-300 hover:bg-zinc-400 transition-colors sm:hidden" />

              <button
                type="button"
                onClick={handleClose}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-3 right-4 sm:top-3.5 sm:right-5 p-2 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Body with iOS Safe Area support */}
            <div className="overflow-y-auto overscroll-contain flex-1 px-6 sm:px-7 pt-2 pb-8 sm:pb-7 [padding-bottom:max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))]">
              {/* Header: Zalo Logo Badge + Product Title + Desc */}
              <div className="flex flex-col items-center text-center mt-1 mb-5">
                <div className="relative mb-3 flex items-center justify-center size-14 rounded-2xl bg-[#f0f5ff] text-[#0068ff] shadow-sm">
                  <ZaloIcon className="size-9" />
                </div>

                <h3
                  id="consult-sheet-title"
                  className="text-lg sm:text-xl font-black text-zinc-900 leading-snug px-2"
                >
                  {productName}
                </h3>

                {(materialName || sizeLabel) && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 text-xs text-brand-primary font-semibold bg-brand-soft px-3 py-1 rounded-full">
                    {materialName && <span>{materialName}</span>}
                    {materialName && sizeLabel && <span>•</span>}
                    {sizeLabel && (
                      <span>
                        {sizeLabel}
                        {sizeDims && !sizeLabel.includes(sizeDims) ? ` (${sizeDims})` : ""}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-zinc-500 mt-2 font-medium">
                  Tư vấn chi tiết hơn về sản phẩm này
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
                    Gửi yêu cầu thành công!
                  </h4>
                  <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
                    Công ty đã nhận được thông tin và đang chuyển bạn đến Zalo để tư vấn trực tiếp...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="consult-phone-input"
                      className="text-xs font-bold text-zinc-700 text-left"
                    >
                      Số điện thoại liên hệ
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
                        placeholder="Ví dụ: 0912 345 678"
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
                        <span>Đang gửi thông tin...</span>
                      </>
                    ) : (
                      <>
                        <ZaloIcon className="size-5 shrink-0" />
                        <span>Nhận tư vấn qua Zalo</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-400 text-center leading-relaxed px-2 pt-1">
                    Thông tin được bảo mật và chỉ dùng để chuyên viên Viet Dragon hỗ trợ báo giá và giải đáp kỹ thuật.
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
