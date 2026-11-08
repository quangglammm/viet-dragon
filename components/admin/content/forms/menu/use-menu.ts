"use client";

import type { Document } from "@/lib/content/editor/api";
import type { Menu } from "@/lib/content/editor/menu-ops";
import type { Vocabulary } from "@/lib/content/editor/vocabulary";
import { useEditor } from "../../editor-context";

// The menu editor's view of the document: typed, with the change-and-hand-back helper the product editor has.

export function useMenu() {
  const editor = useEditor();
  const menu = editor.document as unknown as Menu;
  /** Applies an edit to the document and hands back the result. */
  const apply = (change: (current: Menu) => Menu): Menu => {
    const next = change(menu);
    editor.replace(next as unknown as Document);
    return next;
  };
  return { editor, menu, apply };
}

/** A product as the menu names it: its Vietnamese name, or a note when the product is no longer in this category. */
export const productLabel = (vocab: Vocabulary, product: string): string => vocab.product?.find((entry) => entry.value === product)?.label ?? "Sản phẩm không còn trong danh mục này";
