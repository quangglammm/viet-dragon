"use client";

import { useState } from "react";
import type { FocusRequest } from "./editor-context";

/**
 * Which cards of a list are open, by a key that survives reordering (a uid, a product). A card the editor has just added opens itself
 * (`show`), and so does the one a "go to this problem" request points into: `keyOfPath` says which card holds the path, or undefined
 * when none of this list's does. A request is handled once, in the render it arrives in.
 */
export function useOpenKeys(keyOfPath: (path: string) => string | undefined, focus: FocusRequest | null) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [seen, setSeen] = useState<number | null>(null);
  const show = (key: string) => setOpen((current) => (current.has(key) ? current : new Set([...current, key])));
  // State adjusted while rendering (not in an effect).
  if (focus && focus.nonce !== seen) {
    setSeen(focus.nonce);
    const key = keyOfPath(focus.path);
    if (key !== undefined && !open.has(key)) setOpen(new Set([...open, key]));
  }
  const toggle = (key: string) => setOpen((current) => (current.has(key) ? new Set([...current].filter((id) => id !== key)) : new Set([...current, key])));
  return { isOpen: (key: string) => open.has(key), toggle, show };
}
