"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ArrowLeftRight, Copy, MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductOption } from "@/data/categories";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { ZALO_CHAT_URL } from "@/lib/contact";

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
}: Readonly<MaterialFlashcardProps>) {
  const t = useTranslations("productDetailPage");
  const [flipped, setFlipped] = useState(false);
  const [foilChecked, setFoilChecked] = useState(false);
  const [doubleSidedChecked, setDoubleSidedChecked] = useState(false);
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

  let backImage = option.image ?? fallbackImage;
  if (option.pureImage && !foilChecked) {
    backImage = option.pureImage;
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
    const message = [
      t("optionConsultMessage", { product: productName, url: window.location.href }),
      t("optionConsultMaterialLine", { option: name }),
      t("optionConsultFoilLine", { status: yesNo(foilChecked) }),
      t("optionConsultDoubleSidedLine", { status: yesNo(doubleSidedChecked) }),
    ].join("\n");

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
              <h3 className="font-black text-zinc-900 text-base truncate flex-1">{name}</h3>
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
            <div className="relative w-full h-full bg-zinc-100">
              <Image
                src={backImage}
                alt={`${productName} — ${name}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-5 py-4 flex items-center gap-2.5">
                <span className="text-white font-black text-base truncate flex-1">{name}</span>
                <ArrowLeftRight size={14} strokeWidth={2} className="text-white/60 shrink-0" />
              </div>
            </div>
          </div>
        </motion.div>
      </button>

      {/* Footer — foil/double-sided add-ons + Zalo consult, always visible regardless of flip state */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-zinc-100">
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-zinc-700 cursor-pointer select-none">
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
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-zinc-700 cursor-pointer select-none">
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
          </label>
        </div>

        <div className="relative shrink-0">
          <AnimatePresence>
            {awaitingZaloOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                role="status"
                className="absolute bottom-full right-0 mb-2 w-44 rounded-lg bg-brand-dark px-3 py-2 text-xs leading-snug text-white shadow-lg"
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0068ff] shadow-md shadow-[#0068ff]/30"
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
  );
}
