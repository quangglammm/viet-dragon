"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ArrowLeftRight, Copy, MessageCircle,
  Minus, Plus,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductOption } from "@/data/categories";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { ZALO_CHAT_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";

const optionIconMap: Record<string, LucideIcon> = {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift,
};

// How long the "copied, click again" toast (and its matching icon swap) stays
// up before auto-reverting to the copy step, in case the user never clicks again.
const CONSULT_TOAST_DURATION_MS = 5000;

interface MaterialFlashcardProps {
  option: ProductOption;
  locale: Locale;
  productName: string;
  fallbackImage: string;
  descriptionLabel: string;
  bestForLabel: string;
  viewImageHint: string;
  backToDetailsHint: string;
  foilCheckboxLabel: string;
  doubleSidedCheckboxLabel: string;
  hideFoilCheckbox?: boolean;
  hideDoubleSidedCheckbox?: boolean;
}

export function MaterialFlashcard({
  option,
  locale,
  productName,
  fallbackImage,
  descriptionLabel,
  bestForLabel,
  viewImageHint,
  backToDetailsHint,
  foilCheckboxLabel,
  doubleSidedCheckboxLabel,
  hideFoilCheckbox,
  hideDoubleSidedCheckbox,
}: Readonly<MaterialFlashcardProps>) {
  const t = useTranslations("productDetailPage");
  const [flipped, setFlipped] = useState(false);
  const [foilChecked, setFoilChecked] = useState(false);
  const [doubleSidedChecked, setDoubleSidedChecked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pages, setPages] = useState(16);

  // Two-step consult flow: first click copies the message (and shows a toast
  // asking to click again), second click opens Zalo. Each step's window.open
  // (when it happens) runs synchronously inside that click's own handler, so
  // neither step is a deferred call that popup blockers would flag.
  const [awaitingZaloOpen, setAwaitingZaloOpen] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);
  const OptIcon = optionIconMap[option.icon ?? ""] ?? Layers;
  const name = pickLocale(locale, option.nameVi, option.name);
  const description = pickLocale(locale, option.descriptionVi, option.description);
  const bestFor = pickLocale(locale, option.bestForVi, option.bestFor);

  let basePriceMin = 150000;
  let basePriceMax = 200000;
  let doubleSidedAddon = 25000;
  let foilAddon1Side = 40000;
  let foilAddon2Sides = 70000;

  const n = option.nameVi.toLowerCase();

  // Heuristic pricing based on material name (adjusted to user's logic e.g., 150k-200k for standard)
  if (n.includes("c300") || n.includes("c250") || n.includes("couche")) {
    basePriceMin = 150000; basePriceMax = 200000;
  } else if (n.includes("ford")) {
    basePriceMin = 150000; basePriceMax = 200000;
  } else if (n.includes("mỹ thuật") || n.includes("art")) {
    basePriceMin = 250000; basePriceMax = 350000;
  } else if (n.includes("ngọc trai") || n.includes("pearl")) {
    basePriceMin = 280000; basePriceMax = 380000;
  } else if (n.includes("nhựa") || n.includes("plastic") || n.includes("siêu bền")) {
    basePriceMin = 450000; basePriceMax = 600000;
  } else if (n.includes("dập nổi") || n.includes("dập chìm") || n.includes("embossed")) {
    basePriceMin = 300000; basePriceMax = 450000;
  } else if (n.includes("in nhanh") || n.includes("kỹ thuật số")) {
    basePriceMin = 180000; basePriceMax = 250000;
  } else if (n.includes("đóng ghim")) {
    basePriceMin = 40000; basePriceMax = 60000;
  } else if (n.includes("keo nhiệt") || n.includes("pur")) {
    basePriceMin = 150000; basePriceMax = 220000;
  } else if (n.includes("lò xo") || n.includes("wire")) {
    basePriceMin = 90000; basePriceMax = 140000;
  } else if (n.includes("bìa cứng") || n.includes("carton")) {
    basePriceMin = 450000; basePriceMax = 650000;
  } else if (n.includes("tay gấp") || n.includes("gáy hộp")) {
    basePriceMin = 120000; basePriceMax = 180000;
  } else if (n.includes("uv")) {
    basePriceMin = 220000; basePriceMax = 320000;
  }

  const currentDoubleSidedPrice = doubleSidedChecked ? doubleSidedAddon : 0;
  const currentFoilPrice = foilChecked 
    ? (doubleSidedChecked ? foilAddon2Sides : foilAddon1Side) 
    : 0;

  const hasPages = productName.toLowerCase().includes("catalogue") || productName.toLowerCase().includes("cẩm nang") || productName.toLowerCase().includes("book") || productName.toLowerCase().includes("sách");
    
  let unitMin = basePriceMin + currentDoubleSidedPrice + currentFoilPrice;
  let unitMax = basePriceMax + currentDoubleSidedPrice + currentFoilPrice;
  
  if (hasPages) {
    const pricePerPageMin = 1500;
    const pricePerPageMax = 2500;
    unitMin += pages * pricePerPageMin;
    unitMax += pages * pricePerPageMax;
  }
  
  const totalPriceMin = unitMin * quantity;
  const totalPriceMax = unitMax * quantity;

  let defaultUnitVi = "Cái";
  let defaultUnitEn = "Pieces";
  
  if (productName.toLowerCase().includes("thẻ") || productName.toLowerCase().includes("card") || productName.toLowerCase().includes("danh thiếp")) {
    defaultUnitVi = "Hộp";
    defaultUnitEn = "Boxes";
  } else if (productName.toLowerCase().includes("catalogue") || productName.toLowerCase().includes("cuốn") || productName.toLowerCase().includes("book")) {
    defaultUnitVi = "Cuốn";
    defaultUnitEn = "Books";
  } else if (productName.toLowerCase().includes("folder") || productName.toLowerCase().includes("bìa")) {
    defaultUnitVi = "Cái";
    defaultUnitEn = "Pieces";
  }
  
  const unitLabel = locale === "vi" ? defaultUnitVi : defaultUnitEn;

  let backImages = option.images ?? (option.image ? [option.image] : [fallbackImage]);
  if (!foilChecked && option.pureImages) {
    backImages = option.pureImages;
  } else if (!foilChecked && option.pureImage) {
    backImages = [option.pureImage];
  }

  const clearToastTimeout = () => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  };

  // Clear any pending auto-revert timeout if the card unmounts first.
  useEffect(() => clearToastTimeout, []);

  const handleConsultClick = () => {
    // Step 2: previous click already copied the message — this click opens
    // Zalo, synchronously inside its own handler, so it isn't blocked as a popup.
    if (awaitingZaloOpen) {
      window.open(ZALO_CHAT_URL, "_blank", "noopener,noreferrer");
      clearToastTimeout();
      setAwaitingZaloOpen(false);
      return;
    }

    // Step 1: copy the message. If clipboard access isn't available, fall back
    // to opening Zalo directly since there's nothing left to copy for the user.
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    if (!clipboard) {
      window.open(ZALO_CHAT_URL, "_blank", "noopener,noreferrer");
      return;
    }

    const yesNo = (checked: boolean) => (checked ? t("optionConsultYes") : t("optionConsultNo"));
    const messageLines = [
      t("optionConsultMessage", { product: productName, url: window.location.href }),
      t("optionConsultMaterialLine", { option: name }),
    ];
    
    if (!hideFoilCheckbox) {
      messageLines.push(t("optionConsultFoilLine", { status: yesNo(foilChecked) }));
    }
    if (!hideDoubleSidedCheckbox) {
      messageLines.push(t("optionConsultDoubleSidedLine", { status: yesNo(doubleSidedChecked) }));
    }
    
    const message = messageLines.join("\n");

    clipboard
      .writeText(message)
      .then(() => {
        setAwaitingZaloOpen(true);
        clearToastTimeout();
        toastTimeoutRef.current = window.setTimeout(() => {
          setAwaitingZaloOpen(false);
          toastTimeoutRef.current = null;
        }, CONSULT_TOAST_DURATION_MS);
      })
      .catch(() => {
        // Clipboard write denied (permissions, insecure context) — open Zalo
        // directly since prompting to "click again" wouldn't have anything copied.
        window.open(ZALO_CHAT_URL, "_blank", "noopener,noreferrer");
      });
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-100 overflow-hidden">
      {/* Flip control — description/best-for view <-> material photo. Holds no
          interactive children, so the whole card face can stay one native button. */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? backToDetailsHint : viewImageHint}
        className="block w-full text-left bg-transparent p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front face — description + best-for bullets */}
          <div style={{ backfaceVisibility: "hidden" }}>
            <div className="flex items-center gap-2.5 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
              <OptIcon size={16} className="text-brand-primary shrink-0" />
              <h3 className="font-black text-zinc-900 text-base line-clamp-2 flex-1">{name}</h3>
              <ArrowLeftRight size={14} strokeWidth={2} className="text-zinc-300 shrink-0" />
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  {descriptionLabel}
                </span>
                <ul className="mt-2 flex flex-col gap-2">
                  {description.map((line, i) => {
                    const TraitIcon = materialTraits[option.descriptionTraits[i]]?.icon ?? Layers;
                    return (
                      <li key={line} className="flex items-start gap-2.5 text-sm text-zinc-700 leading-relaxed">
                        <TraitIcon size={14} strokeWidth={1.75} className="mt-0.5 text-brand-primary shrink-0" />
                        <span>{line}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  {bestForLabel}
                </span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {bestFor.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-zinc-700 leading-relaxed">
                      <span className="mt-2 size-1 rounded-full bg-brand-primary shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Back face — image layer, stacked directly behind the front face */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="relative w-full h-full bg-zinc-100 flex flex-col overflow-hidden">
              <div
                className={cn(
                  "grid w-full h-full gap-0.5 bg-white",
                  backImages.length >= 3 ? "grid-cols-1 lg:grid-cols-2 lg:grid-rows-2" : "grid-cols-1"
                )}
              >
                {backImages.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "relative w-full h-full bg-zinc-100",
                      idx > 0 && "hidden lg:block",
                      backImages.length === 3 && idx === 0 && "lg:row-span-2"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${productName} — ${name} - ${idx}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 px-5 py-4 flex items-center gap-2.5">
                <span className="text-white font-black text-base line-clamp-2 flex-1">{name}</span>
                <ArrowLeftRight size={14} strokeWidth={2} className="text-white/60 shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      </button>

      {/* Footer — foil/double-sided add-ons + Zalo consult, always visible regardless of flip state */}
      <div className="flex flex-col border-t border-zinc-100 bg-zinc-50/30">
        
        {/* Optional Pages Row (e.g. for Catalogues) */}
        {hasPages && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100/60 bg-white">
            <span className="text-sm font-semibold text-zinc-700">
              {locale === "vi" ? "Số trang:" : "Pages:"}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center h-8 bg-white border border-zinc-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPages((p) => Math.max(4, p - 4))}
                  className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pages || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPages(val ? parseInt(val, 10) : 0);
                  }}
                  onBlur={() => {
                    if (pages < 4) setPages(4);
                    else setPages(Math.round(pages / 4) * 4);
                  }}
                  className="w-12 h-full text-center text-sm font-semibold text-zinc-700 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPages((p) => p + 4)}
                  className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm font-medium text-zinc-500 min-w-10">
                {locale === "vi" ? "Trang" : "Pages"}
              </span>
            </div>
          </div>
        )}

        {/* Quantity row */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100/60 bg-white">
          <span className="text-sm font-semibold text-zinc-700">
            {locale === "vi" ? "Số lượng:" : "Quantity:"}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center h-8 bg-white border border-zinc-200 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
              >
                <Minus size={14} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={quantity || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setQuantity(val ? parseInt(val, 10) : 0);
                }}
                onBlur={() => {
                  if (quantity < 1) setQuantity(1);
                }}
                className="w-12 h-full text-center text-sm font-semibold text-zinc-700 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-sm font-medium text-zinc-500 min-w-10">{unitLabel}</span>
          </div>
        </div>

        {/* 3-Column Layout: Price Range | Checkboxes | Copy & Chat */}
        <div className="flex items-stretch px-5 py-4">
          
          {/* Cột 1: Giá */}
          <div className="flex flex-col justify-center flex-1">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              {locale === "vi" ? "Thành tiền" : "Total Amount"}
            </div>
            <div className="text-[15px] font-black text-brand-primary leading-tight">
              {totalPriceMin.toLocaleString("vi-VN")}đ <span className="text-zinc-400 font-normal mx-0.5">~</span> {totalPriceMax.toLocaleString("vi-VN")}đ
            </div>
          </div>

          {/* Cột 2: Checkbox */}
          <div className="flex flex-col justify-center gap-3 px-4 border-l border-zinc-200/60 min-w-[170px]">
            {!hideFoilCheckbox && (
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-zinc-700 cursor-pointer select-none">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={foilChecked}
                    onChange={(e) => {
                      setFoilChecked(e.target.checked);
                      clearToastTimeout();
                      setAwaitingZaloOpen(false);
                    }}
                    className="size-4 rounded border-zinc-300 text-brand-primary focus:ring-2 focus:ring-brand-primary/50"
                  />
                  {foilCheckboxLabel}
                </div>
                <span className="text-xs font-medium text-brand-primary whitespace-nowrap">
                  + {(doubleSidedChecked ? foilAddon2Sides : foilAddon1Side).toLocaleString("vi-VN")}đ
                </span>
              </label>
            )}
            {!hideDoubleSidedCheckbox && (
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-zinc-700 cursor-pointer select-none">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={doubleSidedChecked}
                    onChange={(e) => {
                      setDoubleSidedChecked(e.target.checked);
                      clearToastTimeout();
                      setAwaitingZaloOpen(false);
                    }}
                    className="size-4 rounded border-zinc-300 text-brand-primary focus:ring-2 focus:ring-brand-primary/50"
                  />
                  {doubleSidedCheckboxLabel}
                </div>
                <span className="text-xs font-medium text-brand-primary whitespace-nowrap">
                  + {doubleSidedAddon.toLocaleString("vi-VN")}đ
                </span>
              </label>
            )}
          </div>

          {/* Cột 3: Copy & Chat */}
          <div className="flex items-center justify-center pl-4 border-l border-zinc-200/60 relative">
            <AnimatePresence>
              {awaitingZaloOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  role="status"
                  className="absolute bottom-full right-0 mb-2 w-44 rounded-lg bg-brand-dark px-3 py-2 text-xs leading-snug text-white shadow-lg z-10"
                >
                  {t("optionConsultCopiedToast")}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              aria-label={awaitingZaloOpen ? t("optionConsultOpenLabel") : t("optionConsultCopyLabel")}
              onClick={handleConsultClick}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0068ff] shadow-md shadow-[#0068ff]/30 shrink-0"
            >
              {awaitingZaloOpen ? (
                <MessageCircle className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
              ) : (
                <Copy className="h-[18px] w-[18px] text-white" strokeWidth={2.25} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
