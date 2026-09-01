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

  let fallbackBasePrice = 150000;
  let fallbackDoubleSided = 25000;
  let fallbackFoil1Side = 40000;
  let fallbackFoil2Sides = 70000;

  const n = option.nameVi.toLowerCase();
  const p = productName.toLowerCase();

  const isNotepad = p.includes("note") || p.includes("sổ");
  const isStamp = p.includes("tem") || p.includes("decal") || p.includes("nhãn") || p.includes("label");
  const isLiXi = p.includes("lì xì") || p.includes("lixi") || p.includes("lucky");
  const isEnvelope = p.includes("bao thư") || p.includes("phong bì") || p.includes("envelope");
  const isCard = p.includes("thẻ") || p.includes("card") || p.includes("danh thiếp");
  const isFolder = p.includes("folder") || p.includes("bìa kẹp");
  const isCatalogue = p.includes("catalogue") || p.includes("cuốn") || p.includes("book") || p.includes("cẩm nang") || p.includes("menu") || p.includes("sách");
  const isLetterhead = p.includes("letterhead") || p.includes("tiêu đề");
  const isBag = p.includes("túi") || p.includes("bag");
  const isFlyer = p.includes("tờ rơi") || p.includes("tờ gấp") || p.includes("flyer") || p.includes("brochure");
  const isVoucher = p.includes("voucher") || p.includes("phiếu");
  const isGreetingCard = p.includes("thiệp");
  const isTetBox = p.includes("hộp quà tết") || p.includes("hamper");
  const isCalendar = p.includes("lịch") || p.includes("calendar");
  const isBox = p.includes("hộp") || p.includes("box");

  if (isNotepad) {
    if (n.includes("kraft")) {
      fallbackBasePrice = 12000;
      fallbackDoubleSided = 3000; fallbackFoil1Side = 8000; fallbackFoil2Sides = 15000;
    } else if (n.includes("lò xo")) {
      fallbackBasePrice = 20000;
      fallbackDoubleSided = 4000; fallbackFoil1Side = 8000; fallbackFoil2Sides = 15000;
    } else if (n.includes("keo dán")) {
      fallbackBasePrice = 10000;
      fallbackDoubleSided = 2000; fallbackFoil1Side = 5000; fallbackFoil2Sides = 10000;
    } else if (n.includes("couche")) {
      fallbackBasePrice = 15000;
      fallbackDoubleSided = 3000; fallbackFoil1Side = 8000; fallbackFoil2Sides = 15000;
    } else {
      fallbackBasePrice = 8000;
      fallbackDoubleSided = 2000; fallbackFoil1Side = 5000; fallbackFoil2Sides = 10000;
    }
  } else if (isStamp) {
    if (n.includes("vỡ") || n.includes("bảo hành") || n.includes("tamper")) {
      fallbackBasePrice = 300;
      fallbackDoubleSided = 0; fallbackFoil1Side = 0; fallbackFoil2Sides = 0;
    } else if (n.includes("hologram") || n.includes("7 màu")) {
      fallbackBasePrice = 500;
      fallbackDoubleSided = 0; fallbackFoil1Side = 0; fallbackFoil2Sides = 0;
    } else if (n.includes("pvc") || n.includes("nhựa") || n.includes("plastic") || n.includes("trong")) {
      fallbackBasePrice = 500;
      fallbackDoubleSided = 0; fallbackFoil1Side = 400; fallbackFoil2Sides = 0;
    } else if (n.includes("kraft")) {
      fallbackBasePrice = 400;
      fallbackDoubleSided = 0; fallbackFoil1Side = 300; fallbackFoil2Sides = 0;
    } else if (n.includes("couche") || n.includes("màng")) {
      fallbackBasePrice = 200;
      fallbackDoubleSided = 0; fallbackFoil1Side = 250; fallbackFoil2Sides = 0;
    } else if (n.includes("ford") || n.includes("ghi tay") || n.includes("giấy")) {
      fallbackBasePrice = 200;
      fallbackDoubleSided = 0; fallbackFoil1Side = 250; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 300;
      fallbackDoubleSided = 0; fallbackFoil1Side = 200; fallbackFoil2Sides = 0;
    }
  } else if (isLiXi) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 2500;
      fallbackDoubleSided = 0; fallbackFoil1Side = 1200; fallbackFoil2Sides = 0;
    } else if (n.includes("3d") || n.includes("dập nổi") || n.includes("embossed")) {
      fallbackBasePrice = 3000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 1200; fallbackFoil2Sides = 0;
    } else if (n.includes("kraft")) {
      fallbackBasePrice = 800;
      fallbackDoubleSided = 0; fallbackFoil1Side = 800; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 1200;
      fallbackDoubleSided = 0; fallbackFoil1Side = 800; fallbackFoil2Sides = 0;
    }
  } else if (isCard) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 180000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 50000; fallbackFoil2Sides = 90000;
    } else if (n.includes("ngọc trai") || n.includes("pearl")) {
      fallbackBasePrice = 220000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 50000; fallbackFoil2Sides = 90000;
    } else if (n.includes("nhựa") || n.includes("plastic") || n.includes("trong suốt")) {
      fallbackBasePrice = 350000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 80000; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 100000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 40000; fallbackFoil2Sides = 70000;
    }
  } else if (isEnvelope) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 200000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 60000; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 120000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 40000; fallbackFoil2Sides = 0;
    }
  } else if (isFolder) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 15000;
      fallbackDoubleSided = 4000; fallbackFoil1Side = 8000; fallbackFoil2Sides = 15000;
    } else {
      fallbackBasePrice = 6500;
      fallbackDoubleSided = 1500; fallbackFoil1Side = 3500; fallbackFoil2Sides = 6000;
    }
  } else if (isCatalogue) {
    if (n.includes("keo nhiệt") || n.includes("pur")) {
      fallbackBasePrice = 18000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 8000; fallbackFoil2Sides = 0;
    } else if (n.includes("lò xo") || n.includes("wire")) {
      fallbackBasePrice = 22000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 8000; fallbackFoil2Sides = 0;
    } else if (n.includes("bìa cứng") || n.includes("hardcover")) {
      fallbackBasePrice = 35000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 12000; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 12000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 4000; fallbackFoil2Sides = 0;
    }
  } else if (isLetterhead) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 280000;
      fallbackDoubleSided = 50000; fallbackFoil1Side = 0; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 150000;
      fallbackDoubleSided = 40000; fallbackFoil1Side = 0; fallbackFoil2Sides = 0;
    }
  } else if (isBag) {
    if (n.includes("kraft")) {
      fallbackBasePrice = 6500;
      fallbackDoubleSided = 0; fallbackFoil1Side = 2500; fallbackFoil2Sides = 0;
    } else if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 15000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 5000; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 10000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 3000; fallbackFoil2Sides = 0;
    }
  } else if (isFlyer || isVoucher) {
    if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 2000;
      fallbackDoubleSided = 800; fallbackFoil1Side = 1200; fallbackFoil2Sides = 2000;
    } else {
      fallbackBasePrice = 500;
      fallbackDoubleSided = 300; fallbackFoil1Side = 600; fallbackFoil2Sides = 1000;
    }
  } else if (isGreetingCard) {
    if (n.includes("dập nổi") || n.includes("3d") || n.includes("embossed")) {
      fallbackBasePrice = 8000;
      fallbackDoubleSided = 1500; fallbackFoil1Side = 2500; fallbackFoil2Sides = 4000;
    } else if (n.includes("kraft")) {
      fallbackBasePrice = 4000;
      fallbackDoubleSided = 800; fallbackFoil1Side = 1500; fallbackFoil2Sides = 3000;
    } else if (n.includes("mỹ thuật") || n.includes("art") || n.includes("ngọc trai")) {
      fallbackBasePrice = 6500;
      fallbackDoubleSided = 1500; fallbackFoil1Side = 2500; fallbackFoil2Sides = 4000;
    } else {
      fallbackBasePrice = 3000;
      fallbackDoubleSided = 800; fallbackFoil1Side = 1200; fallbackFoil2Sides = 2000;
    }
  } else if (isTetBox || isBox) {
    if (n.includes("carton") || n.includes("bìa cứng") || n.includes("rigid")) {
      fallbackBasePrice = 65000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 12000; fallbackFoil2Sides = 0;
    } else if (n.includes("kraft")) {
      fallbackBasePrice = 12000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 3000; fallbackFoil2Sides = 0;
    } else if (n.includes("ivory") || n.includes("cao cấp")) {
      fallbackBasePrice = 18000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 4500; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 15000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 4000; fallbackFoil2Sides = 0;
    }
  } else if (isCalendar) {
    if (n.includes("gỗ") || n.includes("wood")) {
      fallbackBasePrice = 95000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 15000; fallbackFoil2Sides = 0;
    } else if (n.includes("bìa cứng") || n.includes("carton") || n.includes("chữ a")) {
      fallbackBasePrice = 45000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 10000; fallbackFoil2Sides = 0;
    } else if (n.includes("treo tường") || n.includes("wall")) {
      fallbackBasePrice = 35000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 8000; fallbackFoil2Sides = 0;
    } else {
      fallbackBasePrice = 30000;
      fallbackDoubleSided = 0; fallbackFoil1Side = 6000; fallbackFoil2Sides = 0;
    }
  } else {
    // Ultimate fallback based solely on material text
    if (n.includes("c300") || n.includes("c250") || n.includes("couche")) {
      fallbackBasePrice = 8000;
    } else if (n.includes("ford")) {
      fallbackBasePrice = 8000;
    } else if (n.includes("mỹ thuật") || n.includes("art")) {
      fallbackBasePrice = 15000;
    } else if (n.includes("ngọc trai") || n.includes("pearl")) {
      fallbackBasePrice = 18000;
    } else if (n.includes("nhựa") || n.includes("plastic") || n.includes("siêu bền")) {
      fallbackBasePrice = 25000;
    } else if (n.includes("dập nổi") || n.includes("dập chìm") || n.includes("embossed")) {
      fallbackBasePrice = 20000;
    } else if (n.includes("in nhanh") || n.includes("kỹ thuật số")) {
      fallbackBasePrice = 12000;
    } else if (n.includes("đóng ghim")) {
      fallbackBasePrice = 10000;
    } else if (n.includes("keo nhiệt") || n.includes("pur")) {
      fallbackBasePrice = 18000;
    } else if (n.includes("lò xo") || n.includes("wire")) {
      fallbackBasePrice = 15000;
    } else if (n.includes("bìa cứng") || n.includes("carton")) {
      fallbackBasePrice = 35000;
    } else if (n.includes("tay gấp") || n.includes("gáy hộp")) {
      fallbackBasePrice = 8000;
    } else if (n.includes("uv")) {
      fallbackBasePrice = 15000;
    } else {
      fallbackBasePrice = 8000;
    }
  }

  const basePriceMin = option.basePrice !== undefined ? option.basePrice : fallbackBasePrice;
  const doubleSidedAddon = option.doubleSidedPrice !== undefined ? option.doubleSidedPrice : fallbackDoubleSided;
  const foilAddon1Side = option.foilPrice !== undefined ? option.foilPrice : fallbackFoil1Side;
  const foilAddon2Sides = option.foil2SidesPrice !== undefined 
    ? option.foil2SidesPrice 
    : (option.foilPrice !== undefined && option.foilPrice > 0 ? Math.round(option.foilPrice * 1.75) : fallbackFoil2Sides);

  const currentDoubleSidedPrice = doubleSidedChecked ? doubleSidedAddon : 0;
  const currentFoilPrice = foilChecked 
    ? (doubleSidedChecked ? foilAddon2Sides : foilAddon1Side) 
    : 0;

  const hasPages = productName.toLowerCase().includes("catalogue") || productName.toLowerCase().includes("cẩm nang") || productName.toLowerCase().includes("book") || productName.toLowerCase().includes("sách");
  
  const effectiveHideFoilCheckbox = hideFoilCheckbox || hasPages;
    
  let unitMin = basePriceMin + currentDoubleSidedPrice + currentFoilPrice;
  
  if (hasPages) {
    const pricePerPageMin = 1500;
    unitMin += pages * pricePerPageMin;
  }
  
  const totalPriceMin = unitMin * quantity;

  let defaultUnitVi = "Cái";
  let defaultUnitEn = "Pieces";
  
  if (isCard || isEnvelope) {
    defaultUnitVi = "Hộp";
    defaultUnitEn = "Boxes";
  } else if (isCatalogue || isCalendar || isNotepad) {
    defaultUnitVi = "Cuốn";
    defaultUnitEn = "Books";
  } else if (isLetterhead) {
    defaultUnitVi = "Ram";
    defaultUnitEn = "Reams";
  } else if (isBag) {
    defaultUnitVi = "Túi";
    defaultUnitEn = "Bags";
  } else if (isBox || isTetBox) {
    defaultUnitVi = "Hộp";
    defaultUnitEn = "Boxes";
  } else if (isFlyer || isVoucher) {
    defaultUnitVi = "Tờ";
    defaultUnitEn = "Pieces";
  } else if (isGreetingCard) {
    defaultUnitVi = "Thiệp";
    defaultUnitEn = "Cards";
  } else if (isStamp) {
    defaultUnitVi = "Tem";
    defaultUnitEn = "Stamps";
  }
  
  const unitLabel = locale === "vi" 
    ? (option.unitVi ?? defaultUnitVi) 
    : (option.unitEn ?? defaultUnitEn);

  const maxQuantity = defaultUnitVi === "Hộp" ? 200 : 1000;

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
    
    if (!effectiveHideFoilCheckbox) {
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
                    let num = val ? parseInt(val, 10) : 0;
                    if (num > 200) num = 200;
                    setPages(num);
                  }}
                  onBlur={() => {
                    let num = pages;
                    if (num < 4) num = 4;
                    else num = Math.round(num / 4) * 4;
                    if (num > 200) num = 200;
                    setPages(num);
                  }}
                  className="w-12 h-full text-center text-sm font-semibold text-zinc-700 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPages((p) => Math.min(200, p + 4))}
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
                  let num = val ? parseInt(val, 10) : 0;
                  if (num > maxQuantity) num = maxQuantity;
                  setQuantity(num);
                }}
                onBlur={() => {
                  if (quantity < 1) setQuantity(1);
                  if (quantity > maxQuantity) setQuantity(maxQuantity);
                }}
                className="w-12 h-full text-center text-sm font-semibold text-zinc-700 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                className="w-8 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 hover:text-brand-primary transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-sm font-medium text-zinc-500 min-w-10">{unitLabel}</span>
          </div>
        </div>

        {/* Responsive Layout: Checkboxes Top (Mobile), 3-Column (Desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-stretch p-4 sm:px-5 sm:py-4 gap-4 sm:gap-0">
          
          {/* Cột 2: Checkbox (Mobile: Top, Desktop: Middle) */}
          {(!effectiveHideFoilCheckbox || !hideDoubleSidedCheckbox) && (
            <div className="order-1 sm:order-2 flex flex-col justify-center gap-3 sm:px-4 sm:border-l border-zinc-200/60 sm:min-w-[170px] pb-4 sm:pb-0 border-b sm:border-b-0 border-zinc-200/60">
              {!effectiveHideFoilCheckbox && (
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
          )}

          {/* Wrapper for Price and Copy (Mobile: Bottom row, Desktop: Unwrapped via contents) */}
          <div className="order-2 sm:order-1 flex items-center justify-between sm:contents">
            
            {/* Cột 1: Giá (Mobile: Left, Desktop: Left) */}
            <div className="flex flex-col justify-center sm:flex-1 order-1 sm:order-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                {locale === "vi" ? "Thành tiền" : "Total Amount"}
              </div>
              <div className="text-[15px] font-black text-brand-primary leading-tight">
                {totalPriceMin.toLocaleString("vi-VN")}đ
              </div>
            </div>

            {/* Cột 3: Copy & Chat (Mobile: Right, Desktop: Right) */}
            <div className="flex items-center justify-center sm:pl-4 sm:border-l border-zinc-200/60 relative order-2 sm:order-3 shrink-0">
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
    </div>
  );
}
