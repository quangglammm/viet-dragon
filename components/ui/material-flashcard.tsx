"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import type { ProductOption } from "@/data/categories";
import { materialTraits } from "@/data/material-traits";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

const optionIconMap: Record<string, LucideIcon> = {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift,
};

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
}: MaterialFlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [foilChecked, setFoilChecked] = useState(false);
  const OptIcon = optionIconMap[option.icon ?? ""] ?? Layers;
  const name = pickLocale(locale, option.nameVi, option.name);
  const description = pickLocale(locale, option.descriptionVi, option.description);
  const bestFor = pickLocale(locale, option.bestForVi, option.bestFor);
  const backImage = option.pureImage
    ? (foilChecked ? (option.image ?? fallbackImage) : option.pureImage)
    : (option.image ?? fallbackImage);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      aria-label={flipped ? backToDetailsHint : viewImageHint}
      className="w-full text-left bg-transparent p-0 rounded-2xl border border-zinc-100 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
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
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 leading-relaxed">
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
                {bestFor.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 leading-relaxed">
                    <span className="mt-2 size-1 rounded-full bg-brand-primary shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            {option.pureImage && (
              <label
                className="flex items-center gap-2.5 text-sm font-semibold text-zinc-700 cursor-pointer select-none"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={foilChecked}
                  onChange={(e) => setFoilChecked(e.target.checked)}
                  className="size-4 rounded border-zinc-300 text-brand-primary focus:ring-2 focus:ring-brand-primary/50"
                />
                {foilCheckboxLabel}
              </label>
            )}
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
    </div>
  );
}
