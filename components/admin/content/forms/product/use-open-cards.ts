"use client";

import { useState } from "react";
import { listIndexOf } from "@/lib/content/editor/paths";
import type { FocusRequest } from "../../editor-context";

/**
 * Which cards of a list (shapes, options) are open. Two of them open on their own: one the editor has just added, and the one a
 * "go to this problem" request points into, so the field it names is on screen rather than inside a collapsed card.
 */
export function useOpenCards(list: "shapes" | "options", items: readonly { uid: string }[], focus: FocusRequest | null) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [seen, setSeen] = useState<number | null>(null);
  const show = (uid: string) => setOpen((current) => (current.has(uid) ? current : new Set([...current, uid])));
  // State adjusted while rendering (not in an effect): the request is handled once, in the render it arrives in.
  if (focus && focus.nonce !== seen) {
    setSeen(focus.nonce);
    const index = listIndexOf(focus.path, list);
    const uid = index === null ? undefined : items[index]?.uid;
    if (uid && !open.has(uid)) setOpen(new Set([...open, uid]));
  }
  const toggle = (uid: string) => setOpen((current) => (current.has(uid) ? new Set([...current].filter((id) => id !== uid)) : new Set([...current, uid])));
  return { isOpen: (uid: string) => open.has(uid), toggle, show };
}
