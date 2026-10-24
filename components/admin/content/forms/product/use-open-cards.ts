"use client";

import { listIndexOf } from "@/lib/content/editor/paths";
import type { FocusRequest } from "../../editor-context";
import { useOpenKeys } from "../../use-open-keys";

/** The open shape / option cards of a product, by uid. See `useOpenKeys`. */
export function useOpenCards(list: "shapes" | "options", items: readonly { uid: string }[], focus: FocusRequest | null) {
  return useOpenKeys((path) => {
    const index = listIndexOf(path, list);
    return index === null ? undefined : items[index]?.uid;
  }, focus);
}
