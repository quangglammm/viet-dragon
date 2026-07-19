"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Layers, Sparkles, Palette, Award, Gem, Feather, PenLine, Minimize2, StickyNote,
  Stamp, ShieldCheck, Briefcase, Gift, ImageIcon, X,
  type LucideIcon,
} from "lucide-react";
import type { ProductOption } from "@/data/categories";
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
  useCaseLabel: string;
  viewImageLabel: string;
  backToDetailsLabel: string;
}

export function MaterialFlashcard({
  option,
  locale,
  productName,
  fallbackImage,
  useCaseLabel,
  viewImageLabel,
  backToDetailsLabel,
}: MaterialFlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const OptIcon = optionIconMap[option.icon ?? ""] ?? Layers;
  const name = pickLocale(locale, option.nameVi, option.name);

  return (
    <div className="rounded-2xl border border-zinc-100 overflow-hidden" style={{ perspective: "1600px" }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Front face — use-case summary */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <div className="flex items-center justify-between gap-2.5 px-5 py-4 bg-zinc-50 border-b border-zinc-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <OptIcon size={16} className="text-brand-primary shrink-0" />
              <h3 className="font-black text-zinc-900 text-base truncate">{name}</h3>
            </div>
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label={viewImageLabel}
              className="shrink-0 inline-flex items-center justify-center size-8 rounded-full text-zinc-400 hover:text-brand-primary hover:bg-white transition-colors"
            >
              <ImageIcon size={15} strokeWidth={1.75} />
            </button>
          </div>
          <div className="px-5 py-4 min-h-[132px] flex flex-col justify-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              {useCaseLabel}
            </span>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {pickLocale(locale, option.useCaseVi, option.useCase)}
            </p>
          </div>
        </div>

        {/* Back face — image layer, stacked directly behind the front face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="relative w-full h-full bg-zinc-100">
            <Image
              src={option.image ?? fallbackImage}
              alt={`${productName} — ${name}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-5 py-4">
              <span className="text-white font-black text-base truncate">{name}</span>
              <button
                type="button"
                onClick={() => setFlipped(false)}
                aria-label={backToDetailsLabel}
                className="shrink-0 inline-flex items-center justify-center size-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
