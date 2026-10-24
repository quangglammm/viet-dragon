"use client";

import { setText } from "@/lib/content/editor/paths";
import { followChildNames, type Product } from "@/lib/content/editor/product-ops";
import type { Document } from "@/lib/content/editor/api";
import { TextField } from "../../fields";
import { useProduct } from "./use-product";

/**
 * The name of a shape or option. For one created in this draft, typing a Vietnamese or English name also rebuilds its URLs while they
 * are still the placeholder or the old name's slug (zh/ja/ko follow English). An existing one never has its URL changed by typing.
 */
export function ChildNameField({ kind, uid, path }: Readonly<{ kind: "shapes" | "options"; uid: string; path: string }>) {
  const { editor, product, isNew } = useProduct();
  const follows = isNew(kind, uid) && (editor.language === "vi" || editor.language === "en");

  const onText = (text: string) => {
    const before = [...product.shapes, ...product.options].find((child) => child.uid === uid);
    const typed = setText(editor.document, editor.resolve(path), text) as unknown as Product;
    const next = follows && before ? followChildNames(typed, kind, uid, before) : typed;
    editor.replace(next as unknown as Document);
  };

  return <TextField path={path} required onText={onText} />;
}
