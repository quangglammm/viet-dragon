"use client";

import { percentOf, type Completeness } from "@/lib/content/editor/completeness";
import { LOCALES, type LocaleCode } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";
import { LANGUAGE_NAMES } from "./fields";

// One tab per language, with how much of the document is translated into it. Vietnamese and English are the master languages
// and are required to publish; the others fall back to English wherever a text is missing.

type LanguageTabsProps = {
  active: LocaleCode;
  completeness: Record<LocaleCode, Completeness>;
  onChange: (language: LocaleCode) => void;
};

export function LanguageTabs({ active, completeness, onChange }: Readonly<LanguageTabsProps>) {
  return (
    <div role="tablist" aria-label="Ngôn ngữ đang sửa" className="flex flex-wrap gap-1.5">
      {LOCALES.map((language) => {
        const percent = percentOf(completeness[language]);
        const selected = language === active;
        return (
          <button
            key={language}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(language)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
              selected ? "border-brand-primary bg-brand-primary text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            <span>{LANGUAGE_NAMES[language]}</span>
            <span
              title={`${completeness[language].filled}/${completeness[language].expected} nội dung`}
              className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-black", selected ? "bg-white/25" : percent === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}
            >
              {percent}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
