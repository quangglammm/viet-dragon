"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import type { ProductOption } from "@/data/categories";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ZaloIcon } from "@/components/ui/zalo-icon";
import { ConsultBottomSheet } from "@/components/ui/consult-bottom-sheet";

const optionIconMap: Record<string, LucideIcon> = {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift,
};

const ZALO_BUTTON_LABEL: Record<string, string> = {
  vi: "Tư vấn Zalo",
  en: "Zalo Consultation",
  zh: "Zalo 咨询",
  ja: "Zalo 相談",
  ko: "Zalo 상담",
};

interface SizeItem {
  id: "large" | "medium" | "small";
  label: string;
  dims: string;
}

function getProductSizes(productName: string, locale: Locale): SizeItem[] {
  const p = productName.toLowerCase();

  const isCard = p.includes("thẻ") || p.includes("card") || p.includes("danh thiếp");
  const isEnvelope = p.includes("bao thư") || p.includes("phong bì") || p.includes("envelope");
  const isBox = p.includes("hộp quà") || p.includes("box") || p.includes("lì xì") || p.includes("lixi");
  const isFlyer = p.includes("tờ rơi") || p.includes("tờ gấp") || p.includes("flyer") || p.includes("brochure") || p.includes("voucher");
  const isCatalogue = p.includes("catalogue") || p.includes("cuốn") || p.includes("sách") || p.includes("menu") || p.includes("cẩm nang");
  const isNotepad = p.includes("note") || p.includes("sổ");
  const isStamp = p.includes("tem") || p.includes("decal") || p.includes("nhãn") || p.includes("label");
  const isCalendar = p.includes("lịch") || p.includes("calendar");

  const lLabel = locale === "vi" ? "Lớn" : locale === "zh" ? "大号" : locale === "ja" ? "大" : locale === "ko" ? "대" : "Large";
  const mLabel = locale === "vi" ? "Vừa" : locale === "zh" ? "中号" : locale === "ja" ? "中" : locale === "ko" ? "중" : "Medium";
  const sLabel = locale === "vi" ? "Nhỏ" : locale === "zh" ? "小号" : locale === "ja" ? "小" : locale === "ko" ? "소" : "Small";

  if (isCard) {
    return [
      { id: "large", label: lLabel, dims: "10.8 x 9 cm" },
      { id: "medium", label: mLabel, dims: "9 x 5.4 cm" },
      { id: "small", label: sLabel, dims: "9 x 5 cm" },
    ];
  }
  if (isEnvelope) {
    return [
      { id: "large", label: `${lLabel} (A4)`, dims: "25 x 34 cm" },
      { id: "medium", label: `${mLabel} (A5)`, dims: "16 x 23 cm" },
      { id: "small", label: `${sLabel} (A6)`, dims: "12 x 22 cm" },
    ];
  }
  if (isBox) {
    return [
      { id: "large", label: lLabel, dims: "36 x 26 x 10 cm" },
      { id: "medium", label: mLabel, dims: "28 x 20 x 8 cm" },
      { id: "small", label: sLabel, dims: "20 x 15 x 6 cm" },
    ];
  }
  if (isFlyer) {
    return [
      { id: "large", label: `${lLabel} (A4)`, dims: "21 x 29.7 cm" },
      { id: "medium", label: `${mLabel} (A5)`, dims: "14.8 x 21 cm" },
      { id: "small", label: `${sLabel} (A6)`, dims: "10.5 x 14.8 cm" },
    ];
  }
  if (isCatalogue || isNotepad) {
    return [
      { id: "large", label: `${lLabel} (A4)`, dims: "20.5 x 29.5 cm" },
      { id: "medium", label: `${mLabel} (A5)`, dims: "14.5 x 20.5 cm" },
      { id: "small", label: `${sLabel} (B5)`, dims: "17 x 25 cm" },
    ];
  }
  if (isStamp) {
    return [
      { id: "large", label: lLabel, dims: "8 x 8 cm" },
      { id: "medium", label: mLabel, dims: "5 x 5 cm" },
      { id: "small", label: sLabel, dims: "3 x 3 cm" },
    ];
  }
  if (isCalendar) {
    return [
      { id: "large", label: lLabel, dims: "24 x 18 cm" },
      { id: "medium", label: mLabel, dims: "20 x 15 cm" },
      { id: "small", label: sLabel, dims: "16 x 12 cm" },
    ];
  }

  // Mặc định (Túi giấy theo thegioiinan.com trong mau.txt)
  return [
    { id: "large", label: lLabel, dims: "41 x 29 x 10 cm" },
    { id: "medium", label: mLabel, dims: "35 x 25 x 10 cm" },
    { id: "small", label: sLabel, dims: "30 x 20 x 5 cm" },
  ];
}

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
}: Readonly<MaterialFlashcardProps>) {
  const [flipped, setFlipped] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"large" | "medium" | "small" | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);

  const OptIcon = optionIconMap[option.icon ?? ""] ?? Layers;
  const rawName = pickLocale(locale, option.nameVi, option.name, option.nameZh, option.nameJa, option.nameKo);
  const name = formatMaterialDisplayName(rawName, locale);
  const description = pickLocale(locale, option.descriptionVi, option.description, option.descriptionZh, option.descriptionJa, option.descriptionKo);
  const bestFor = pickLocale(locale, option.bestForVi, option.bestFor, option.bestForZh, option.bestForJa, option.bestForKo);

  const sizes = getProductSizes(productName, locale);
  const selectedSizeItem = sizes.find((s) => s.id === selectedSize);
  const printTechList = PRINT_TECHNIQUES[locale] ?? PRINT_TECHNIQUES.vi;
  const finishingList = FINISHING_OPTIONS[locale] ?? FINISHING_OPTIONS.vi;
  const laminationList = LAMINATION_OPTIONS[locale] ?? LAMINATION_OPTIONS.vi;

  let rawImages: string[] = [];
  if (option.pureImages && option.pureImages.length > 0) {
    rawImages = option.pureImages;
  } else if (option.images && option.images.length > 0) {
    rawImages = option.images;
  } else if (option.pureImage) {
    rawImages = [option.pureImage];
  } else if (option.image) {
    rawImages = [option.image];
  } else if (fallbackImage) {
    rawImages = [fallbackImage];
  }

  // Ensure 3 images are always present so the 3-image collage style (left 1 large, right 2 stacked) is ALWAYS active
  let cardImages = [...rawImages];
  if (cardImages.length === 1) {
    cardImages = [cardImages[0], cardImages[0], cardImages[0]];
  } else if (cardImages.length === 2) {
    cardImages = [cardImages[0], cardImages[1], cardImages[0]];
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-100 overflow-hidden">
      {/* Flip control — material photo view (default) <-> description/best-for view. Holds no
          interactive children, so the whole card face can stay one native button. */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? viewImageHint : backToDetailsHint}
        className="block w-full text-left bg-transparent p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        style={{ perspective: "1600px" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* Front face — image layer (hiển thị ảnh trước, mặc định) */}
          <div
            className="relative w-full aspect-square sm:aspect-square lg:aspect-auto lg:h-[320px] max-h-[440px] lg:max-h-none bg-zinc-100 flex flex-col overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              className={cn(
                "grid w-full h-full gap-0.5 bg-white",
                cardImages.length >= 3 ? "grid-cols-1 lg:grid-cols-2 lg:grid-rows-2" : "grid-cols-1"
              )}
            >
              {cardImages.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "relative w-full h-full bg-zinc-100",
                    idx > 0 && "hidden lg:block",
                    cardImages.length === 3 && idx === 0 && "lg:row-span-2"
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
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 px-5 py-4 flex items-center gap-2.5">
              <OptIcon size={16} className="text-white shrink-0" />
              <span className="text-white font-black text-base line-clamp-2 flex-1">{name}</span>
              <ArrowLeftRight size={14} strokeWidth={2} className="text-white/60 shrink-0" />
            </div>
          </div>

          {/* Back face — description + best-for bullets (lật thẻ để xem đặc tính chi tiết) */}
          <div
            className="absolute inset-0 bg-white flex flex-col justify-between overflow-y-auto"
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
        </motion.div>
      </button>

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
