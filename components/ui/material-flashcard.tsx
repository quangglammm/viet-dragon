"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ArrowLeftRight, ImagePlus, ChevronLeft, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { ProductOption } from "@/data/categories";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ZaloIcon } from "@/components/ui/zalo-icon";
import { ConsultBottomSheet } from "@/components/ui/consult-bottom-sheet";
import { getProductSizes } from "@/lib/product-sizes";

const optionIconMap: Record<string, LucideIcon> = {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift,
};

const SLOT_LABEL: Record<string, { main: string; detail: string }> = {
  vi: { main: "Ảnh chính", detail: "Ảnh chi tiết" },
  en: { main: "Main photo", detail: "Detail photo" },
  zh: { main: "主图", detail: "细节图" },
  ja: { main: "メイン写真", detail: "詳細写真" },
  ko: { main: "대표 사진", detail: "상세 사진" },
};

interface ImageSlotProps {
  src?: string;
  alt: string;
  aspectClass: string;
  sizes: string;
  isMain?: boolean;
  locale?: string;
  fitMode?: "cover" | "contain";
}

function ImageSlot({
  src,
  alt,
  aspectClass,
  sizes,
  isMain,
  locale = "vi",
  fitMode = "cover",
}: Readonly<ImageSlotProps>) {
  const [hasError, setHasError] = useState(false);
  const labels = SLOT_LABEL[locale] ?? SLOT_LABEL.vi;

  const showPlaceholder = !src || hasError;

  return (
    <div className={cn("relative w-full h-full bg-zinc-100 overflow-hidden", aspectClass)}>
      {showPlaceholder ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200/50 p-2 select-none">
          <div className="flex flex-col items-center justify-center gap-1.5 text-zinc-400">
            <div className="p-2 rounded-xl bg-white/80 shadow-2xs border border-zinc-200/60">
              <ImagePlus size={isMain ? 22 : 16} strokeWidth={1.5} className="text-zinc-400" />
            </div>
            <span className="text-[10px] font-medium tracking-wide text-zinc-400">
              {isMain ? labels.main : labels.detail}
            </span>
          </div>
        </div>
      ) : fitMode === "contain" ? (
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/10 overflow-hidden">
          {/* Ambient blurred backdrop using the same image */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Image
              src={src}
              alt=""
              fill
              sizes="25vw"
              quality={30}
              className="object-cover blur-2xl scale-125 opacity-40 brightness-95"
            />
          </div>
          {/* Sharp, uncropped image fitting cleanly inside the frame */}
          <div className="relative w-full h-full p-2 flex items-center justify-center">
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              quality={85}
              className="object-contain scale-[0.92] drop-shadow-md"
              onError={() => setHasError(true)}
            />
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={85}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

const ZALO_BUTTON_LABEL: Record<string, string> = {
  vi: "Tư vấn Zalo",
  en: "Zalo Consultation",
  zh: "Zalo 咨询",
  ja: "Zalo 相談",
  ko: "Zalo 상담",
};



const PRINT_TECHNIQUES: Record<string, string[]> = {
  vi: ["In nhanh", "Offset", "Ép kim", "Dập nổi dập chìm"],
  en: ["Fast print", "Offset", "Foil stamping", "Emboss / deboss"],
  zh: ["快印", "胶印 (Offset)", "烫金", "压凸/压凹"],
  ja: ["オンデマンド印刷", "オフセット", "箔押し", "型押し・エンボス"],
  ko: ["디지털 인쇄", "옵셋", "박 인쇄", "형압 / 엠보싱"],
};

const FINISHING_OPTIONS: Record<string, string[]> = {
  vi: ["Bế bo 4 góc", "Cắt vuông"],
  en: ["Rounded 4 corners", "Square cut"],
  zh: ["四角圆角模切", "直角裁切"],
  ja: ["4角角丸加工", "直角断裁"],
  ko: ["4각 귀도리 (라운딩)", "직각 재단"],
};

const LAMINATION_OPTIONS: Record<string, string[]> = {
  vi: ["Bóng", "Mờ", "Không cán màng"],
  en: ["Gloss", "Matte", "No lamination"],
  zh: ["光膜", "哑膜", "不覆膜"],
  ja: ["グロス", "マット", "加工なし"],
  ko: ["유광", "무광", "코팅 없음"],
};

const FORM_TITLES: Record<string, Record<string, string>> = {
  sizes: {
    vi: "Kích thước phổ biến:",
    en: "Popular sizes:",
    zh: "常用尺寸:",
    ja: "一般的なサイズ:",
    ko: "자주 쓰이는 규격:",
  },
  printTech: {
    vi: "Kỹ thuật in:",
    en: "Printing technique:",
    zh: "印刷工艺:",
    ja: "印刷技術:",
    ko: "인쇄 기법:",
  },
  finishing: {
    vi: "Thành phẩm:",
    en: "Finishing:",
    zh: "后道成品:",
    ja: "後加工・仕上がり:",
    ko: "후가공 / 마감:",
  },
  lamination: {
    vi: "Kỹ thuật cán màng:",
    en: "Lamination:",
    zh: "覆膜工艺:",
    ja: "ラミネート加工:",
    ko: "코팅 기법:",
  },
};

function formatMaterialDisplayName(name: string, locale: Locale): string {
  if (locale === "vi") {
    if (/^(c300(\s*\(chuẩn\))?|c300\s*-\s*c350.*|couche\b.*|giấy\s+couche\b.*)$/i.test(name)) {
      if (/bồi carton/i.test(name)) {
        return name.replace(/couche/i, "Giấy loại C");
      }
      return "Giấy loại C";
    }
    if (/^c300\s+ép kim/i.test(name)) {
      return "Giấy loại C Ép Kim Vàng";
    }
    if (/^(ford\s*300(gsm)?(\s*\(.*\))?|ford\s+\d+.*(\(.*\))?|ruột\s+giấy\s+ford.*|lịch\s+để\s+bàn\s+giấy\s+ford.*)$/i.test(name)) {
      return "Giấy loại F";
    }
    if (/^ivory\b.*$/i.test(name)) {
      return "Giấy loại I";
    }

    let result = name;
    result = result.replace(/\bgiấy\s+couche\b/gi, "Giấy loại C");
    result = result.replace(/\b(c300|couche)\b/gi, "Giấy loại C");
    result = result.replace(/\bgiấy\s+ford(\s*300(gsm)?)?\b/gi, "Giấy loại F");
    result = result.replace(/\bford\s*300(gsm)?\b/gi, "Giấy loại F");
    result = result.replace(/\bford\b/gi, "Giấy loại F");
    result = result.replace(/\bgiấy\s+ivory\b/gi, "Giấy loại I");
    result = result.replace(/\bivory\b/gi, "Giấy loại I");
    return result;
  }
  if (locale === "en") {
    if (/^(c300.*|couche.*)$/i.test(name)) {
      if (/corrugated|carton/i.test(name)) {
        return name.replace(/couche/i, "Type C Paper");
      }
      return "Type C Paper";
    }
    if (/^ford\b.*$/i.test(name)) {
      return "Type F Paper";
    }
    if (/^ivory\b.*$/i.test(name)) {
      return "Type I Paper";
    }
    let result = name;
    result = result.replace(/\b(c300|couche)\b/gi, "Type C Paper");
    result = result.replace(/\bford\s*300(gsm)?\b/gi, "Type F Paper");
    result = result.replace(/\bford\b/gi, "Type F Paper");
    result = result.replace(/\bivory\b/gi, "Type I Paper");
    return result;
  }
  if (locale === "zh") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /铜版纸/.test(name)) return "C类纸";
    if (/^ford\b/i.test(name) || /道林纸/.test(name)) return "F类纸";
    if (/^ivory\b/i.test(name) || /白卡纸/.test(name)) return "I类纸";
  }
  if (locale === "ja") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /コート紙/.test(name)) return "Cタイプ用紙";
    if (/^ford\b/i.test(name) || /上質紙/.test(name)) return "Fタイプ用紙";
    if (/^ivory\b/i.test(name) || /アイボリー/.test(name)) return "Iタイプ用紙";
  }
  if (locale === "ko") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /아트지/.test(name)) return "C타입 용지";
    if (/^ford\b/i.test(name) || /모조지/.test(name)) return "F타입 용지";
    if (/^ivory\b/i.test(name) || /백상지|아이보리/.test(name)) return "I타입 용지";
  }
  return name;
}

interface MaterialFlashcardProps {
  option: ProductOption;
  locale: Locale;
  productName: string;
  fallbackImage: string;
  descriptionLabel: string;
  bestForLabel: string;
  viewImageHint: string;
  backToDetailsHint: string;
  foilCheckboxLabel?: string;
  doubleSidedCheckboxLabel?: string;
  hideFoilCheckbox?: boolean;
  hideDoubleSidedCheckbox?: boolean;
  productId?: string;
  shapeId?: string;
  categoryId?: string;
}

export function MaterialFlashcard({
  option,
  locale,
  productName,
  descriptionLabel,
  bestForLabel,
  viewImageHint,
  backToDetailsHint,
  productId,
  shapeId,
  categoryId,
}: Readonly<MaterialFlashcardProps>) {
  const [flipped, setFlipped] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"large" | "medium" | "small" | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);
  const [mobileImageIdx, setMobileImageIdx] = useState(0);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const ignoreClickUntil = useRef<number>(0);

  const OptIcon = optionIconMap[option.icon ?? ""] ?? Layers;
  const rawName = pickLocale(locale, option.nameVi, option.name, option.nameZh, option.nameJa, option.nameKo);
  const name = formatMaterialDisplayName(rawName, locale);
  const description = pickLocale(locale, option.descriptionVi, option.description, option.descriptionZh, option.descriptionJa, option.descriptionKo);
  const bestFor = pickLocale(locale, option.bestForVi, option.bestFor, option.bestForZh, option.bestForJa, option.bestForKo);

  const sizes = getProductSizes(productName, locale, productId, shapeId, categoryId);
  const selectedSizeItem = sizes.find((s) => s.id === selectedSize);
  const printTechList = PRINT_TECHNIQUES[locale] ?? PRINT_TECHNIQUES.vi;
  const finishingList = FINISHING_OPTIONS[locale] ?? FINISHING_OPTIONS.vi;
  const laminationList = LAMINATION_OPTIONS[locale] ?? LAMINATION_OPTIONS.vi;

  let rawImages: string[] = [];
  if (option.pureImages && option.pureImages.length > 0) {
    rawImages = option.pureImages.map((s) => s?.trim() ?? "");
  } else if (option.images && option.images.length > 0) {
    rawImages = option.images.map((s) => s?.trim() ?? "");
  } else if (option.pureImage) {
    rawImages = [option.pureImage.trim()];
  } else if (option.image) {
    rawImages = [option.image.trim()];
  }

  // Ensure 3 slots are always present for the collage
  let cardImages: [string, string, string] = ["", "", ""];
  if (rawImages.length === 1) {
    cardImages = [rawImages[0], rawImages[0], rawImages[0]];
  } else if (rawImages.length === 2) {
    cardImages = [rawImages[0], rawImages[1], rawImages[0]];
  } else if (rawImages.length >= 3) {
    cardImages = [rawImages[0], rawImages[1], rawImages[2]];
  }

  // Mobile unique images for carousel
  const uniqueImages = Array.from(new Set(rawImages.filter((img): img is string => Boolean(img))));
  const displayImages = uniqueImages.length > 0
    ? uniqueImages
    : (cardImages.filter(Boolean).length > 0 ? Array.from(new Set(cardImages.filter(Boolean))) : [""]);

  const currentMobileIdx = ((mobileImageIdx % displayImages.length) + displayImages.length) % displayImages.length;
  const currentMobileImg = displayImages[currentMobileIdx];

  const handleCardFlip = () => {
    if (Date.now() < ignoreClickUntil.current) return;
    setFlipped((f) => !f);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    ignoreClickUntil.current = Date.now() + 350;
    setMobileImageIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    ignoreClickUntil.current = Date.now() + 350;
    setMobileImageIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isSwiping.current = true;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          setMobileImageIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
        } else {
          setMobileImageIdx((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
        }
        ignoreClickUntil.current = Date.now() + 400;
      } else if (isSwiping.current) {
        ignoreClickUntil.current = Date.now() + 400;
      }
    }
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-100 overflow-hidden">
      {/* Flip control — material photo view (default) <-> description/best-for view. */}
      <div
        role="region"
        aria-label={flipped ? viewImageHint : backToDetailsHint}
        className="block w-full text-left bg-transparent p-0 select-none"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front face — image layer */}
          <div
            className="relative w-full aspect-square md:aspect-[2/1] bg-zinc-100 flex flex-col overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Desktop 3-image collage */}
            <div
              onClick={handleCardFlip}
              className="hidden md:grid grid-cols-2 w-full h-full gap-0.5 bg-white cursor-pointer"
            >
              <ImageSlot
                src={cardImages[0]}
                alt={`${productName} — ${name} - 0`}
                aspectClass="aspect-square"
                sizes="(min-width: 1024px) 25vw, 50vw"
                isMain
                locale={locale}
              />

              <div className="grid grid-rows-2 gap-0.5 w-full h-full">
                <ImageSlot
                  src={cardImages[1]}
                  alt={`${productName} — ${name} - 1`}
                  aspectClass="aspect-[2/1]"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  locale={locale}
                />
                <ImageSlot
                  src={cardImages[2]}
                  alt={`${productName} — ${name} - 2`}
                  aspectClass="aspect-[2/1]"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  locale={locale}
                />
              </div>
            </div>

            {/* Mobile 1-image carousel with swipe & navigation arrows */}
            <div
              className="relative block md:hidden w-full h-full overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleCardFlip}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentMobileIdx}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <ImageSlot
                    src={currentMobileImg}
                    alt={`${productName} — ${name} - ${currentMobileIdx + 1}`}
                    aspectClass="w-full h-full"
                    sizes="100vw"
                    isMain={currentMobileIdx === 0}
                    fitMode={currentMobileIdx === 0 ? "cover" : "contain"}
                    locale={locale}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Mobile navigation arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    onClick={handlePrevImage}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="absolute left-2.5 top-[44%] -translate-y-1/2 z-20 size-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md border border-zinc-200/60 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    aria-label="Ảnh tiếp theo"
                    onClick={handleNextImage}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="absolute right-2.5 top-[44%] -translate-y-1/2 z-20 size-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md border border-zinc-200/60 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>

            {/* Gradient shadow for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-dark/95 via-brand-dark/40 to-transparent pointer-events-none" />
            
            {/* Front bottom bar: Option title, flip hint, and pagination dots */}
            <div
              onClick={handleCardFlip}
              className="absolute inset-x-0 bottom-0 px-5 pt-4 pb-3 md:pb-4 flex flex-col gap-2 z-10 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <OptIcon size={16} className="text-white shrink-0" />
                <span className="text-white font-black text-base line-clamp-2 flex-1">{name}</span>
                <ArrowLeftRight size={14} strokeWidth={2} className="text-white/60 shrink-0" />
              </div>

              {/* Mobile pagination dots centered at bottom of card */}
              {displayImages.length > 1 && (
                <div className="flex md:hidden items-center justify-center gap-1.5 pointer-events-none">
                  {displayImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        idx === currentMobileIdx
                          ? "w-4 h-1.5 bg-white shadow-xs"
                          : "size-1.5 bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Back face — description + best-for bullets */}
          <div
            onClick={handleCardFlip}
            className="absolute inset-0 bg-white flex flex-col justify-between overflow-y-auto cursor-pointer"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex items-center gap-2.5 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
              <OptIcon size={16} className="text-brand-primary shrink-0" />
              <h3 className="font-black text-zinc-900 text-base line-clamp-2 flex-1">{name}</h3>
              <ArrowLeftRight size={14} strokeWidth={2} className="text-zinc-300 shrink-0" />
            </div>
            <div className="px-5 py-4 flex flex-col gap-4 flex-1 justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  {descriptionLabel}
                </span>
                <ul className="mt-2 flex flex-col gap-2">
                  {description.map((line, i) => {
                    const TraitIcon = materialTraits[option.descriptionTraits?.[i]]?.icon ?? Layers;
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
        </motion.div>
      </div>

      {/* Form quy cách sản phẩm (Kích thước phổ biến, Kỹ thuật in, Thành phẩm, Cán màng) */}
      <div className="flex flex-col gap-4 p-5 bg-white border-t border-zinc-100">
        
        {/* 1. Kích thước phổ biến (thu nhỏ vừa với chữ, click để nở ra ghi đè kích thước luôn bên trong ô, click lại hiện lại chữ) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 shrink-0">
            {FORM_TITLES.sizes[locale] ?? FORM_TITLES.sizes.vi}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {sizes.map((s) => {
              const isSelected = selectedSize === s.id;
              return (
                <motion.button
                  layout
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSize((prev) => (prev === s.id ? null : s.id))}
                  transition={{ layout: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }}
                  className={cn(
                    "inline-flex items-center justify-center px-3 py-1.5 rounded-lg border text-xs transition-colors duration-200 cursor-pointer select-none overflow-hidden",
                    isSelected
                      ? "bg-[#ede8ff] border-brand-primary text-brand-primary ring-1 ring-brand-primary/40 shadow-xs font-semibold"
                      : "bg-[#f3f5ff] border-brand-primary/25 text-brand-primary hover:bg-[#eae8ff] hover:border-brand-primary/40 font-bold"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSelected ? (
                      <motion.span
                        key="dims"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap font-semibold text-brand-primary"
                      >
                        {s.dims}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap font-bold"
                      >
                        {s.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 2. Kỹ thuật in: in nhanh, offset, ép kim, dập nổi dập chìm */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 shrink-0">
            {FORM_TITLES.printTech[locale] ?? FORM_TITLES.printTech.vi}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {printTechList.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#7000fe]/30 bg-transparent text-xs font-medium text-zinc-700 select-none cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Thành phẩm: bế bo 4 góc hoặc cắt vuông */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 shrink-0">
            {FORM_TITLES.finishing[locale] ?? FORM_TITLES.finishing.vi}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {finishingList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#7000fe]/30 bg-transparent text-xs font-medium text-zinc-700 select-none cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Với kỹ thuật cán màng: bóng, mờ hoặc ko cán màng */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-bold text-zinc-900 shrink-0">
            {FORM_TITLES.lamination[locale] ?? FORM_TITLES.lamination.vi}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {laminationList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#7000fe]/30 bg-transparent text-xs font-medium text-zinc-700 select-none cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom action row: Nút tư vấn Zalo */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-100 gap-3">
          <motion.button
            type="button"
            aria-label={ZALO_BUTTON_LABEL[locale] ?? ZALO_BUTTON_LABEL.vi}
            onClick={() => setConsultOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0068ff] hover:bg-[#0057d6] text-white text-xs font-bold shadow-sm shadow-[#0068ff]/30 transition-all cursor-pointer"
          >
            <ZaloIcon className="size-4 shrink-0" />
            <span>{ZALO_BUTTON_LABEL[locale] ?? ZALO_BUTTON_LABEL.vi}</span>
          </motion.button>
        </div>

      </div>

      <ConsultBottomSheet
        isOpen={consultOpen}
        onClose={() => setConsultOpen(false)}
        productName={productName}
        materialName={name}
        sizeLabel={selectedSizeItem?.label}
        sizeDims={selectedSizeItem?.dims}
      />
    </div>
  );
}
