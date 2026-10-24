"use client";

import { useEditor } from "../../editor-context";
import type { Document } from "@/lib/content/editor/api";
import type { Product } from "@/lib/content/editor/product-ops";
import type { VocabOption } from "@/lib/content/editor/vocabulary";
import type { LocaleCode } from "@/lib/content/schemas";

// The product editor's view of the document: typed, and with the "what was already published" question answered.

type Shape = Product["shapes"][number];

export function useProduct() {
  const editor = useEditor();
  const product = editor.document as unknown as Product;
  /** Applies an edit to the document and hands back the result (to find what an "add" just created). */
  const apply = (change: (current: Product) => Product): Product => {
    const next = change(product);
    editor.replace(next as unknown as Document);
    return next;
  };
  /** A shape or option that is not in the published document: created in this draft, so its URL may still follow its name. */
  const isNew = (kind: "shapes" | "options", uid: string): boolean => !((editor.baseline?.[kind] as { uid: string }[] | undefined) ?? []).some((child) => child.uid === uid);
  return { editor, product, apply, isNew };
}

/** How a shape is called in lists and in the scope pickers: its name in the language being edited, else any name, else its URL. */
export function shapeName(shape: Shape, language: LocaleCode): string {
  return shape.i18n[language]?.name ?? shape.i18n.vi?.name ?? shape.i18n.en?.name ?? shape.slugs.vi.slug;
}

export function scopeOptions(product: Product, language: LocaleCode): VocabOption[] {
  return product.shapes.map((shape) => ({ value: shape.uid, label: shapeName(shape, language) }));
}

export const WHOLE_PRODUCT = "Cả sản phẩm";

/** The groups an option / size / spec list is shown in: the whole product first, then each shape. */
export function scopes(product: Product, language: LocaleCode): { shape: string | null; title: string }[] {
  return [{ shape: null, title: WHOLE_PRODUCT }, ...product.shapes.map((shape) => ({ shape: shape.uid, title: `Hình thức: ${shapeName(shape, language)}` }))];
}
