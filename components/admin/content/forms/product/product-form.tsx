"use client";

import { useState } from "react";
import { PRODUCT_SECTIONS, sectionOfPath, type ProductSection } from "@/lib/content/editor/product-sections";
import { cn } from "@/lib/utils";
import { useEditor, type FocusRequest } from "../../editor-context";
import { GeneralSection } from "./general-section";
import { OptionsSection } from "./options-section";
import { ShapesSection } from "./shapes-section";
import { SizesSection } from "./sizes-section";
import { SpecsSection } from "./specs-section";
import { UrlsSection } from "./urls-section";

// A product has too much to show at once, so it is edited in six tabs of one draft. Only the open tab is drawn; a problem the
// document reports opens the tab that holds it, and each tab shows how many problems it has.

type ProductFormProps = {
  /** Draws this tab regardless of the choice (the coverage test renders each tab in turn). */
  section?: ProductSection;
  /** Opens every shape and option card (for the same test). */
  expandAll?: boolean;
};

export function ProductForm({ section: forced, expandAll = false }: Readonly<ProductFormProps>) {
  const { issues, focus } = useEditor();
  const [chosen, setChosen] = useState<ProductSection>("general");
  const [seen, setSeen] = useState<number | null>(null);
  // The request that opened the current tab: its cards open themselves. Choosing a tab by hand drops it, so an old request never
  // opens a card later.
  const [fresh, setFresh] = useState<FocusRequest | null>(null);
  // "Go to this problem" arrives as a request; the tab that holds the field opens (state adjusted while rendering, not in an effect).
  if (focus && focus.nonce !== seen) {
    setSeen(focus.nonce);
    setChosen(sectionOfPath(focus.path));
    setFresh(focus);
  }
  const section = forced ?? chosen;
  const problems = (id: ProductSection) => issues.filter((issue) => sectionOfPath(issue.path) === id).length;

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Phần của sản phẩm" className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {PRODUCT_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === section}
            onClick={() => { setChosen(id); setFresh(null); }}
            className={cn("flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors", id === section ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100")}
          >
            {label}
            {problems(id) > 0 && <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">{problems(id)}</span>}
          </button>
        ))}
      </div>
      {section === "general" && <GeneralSection />}
      {section === "urls" && <UrlsSection />}
      {section === "shapes" && <ShapesSection expandAll={expandAll} focus={fresh} />}
      {section === "options" && <OptionsSection expandAll={expandAll} focus={fresh} />}
      {section === "sizes" && <SizesSection />}
      {section === "specs" && <SpecsSection />}
    </div>
  );
}
