"use client";

import { useEffect, useRef } from "react";
import { DEEP_LINK_SCROLL_DELAY_MS, findHashTarget, smoothScrollToElement } from "@/lib/hash-navigation";

interface AutoScrollToTargetProps {
  readonly targetId?: string;
  readonly altTargetId?: string;
}

export function AutoScrollToTarget({
  targetId,
  altTargetId,
}: AutoScrollToTargetProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // A URL hash that resolves to an element is handled by SmoothScroll; this
    // covers deep links without a hash, and a stale hash that matches nothing.
    if (findHashTarget(window.location.hash)) return;
    const rawId = targetId || altTargetId;
    if (!rawId) return;
    const idToScroll: string = rawId;

    function executeScroll() {
      const el =
        document.getElementById(idToScroll) ||
        (altTargetId ? document.getElementById(altTargetId) : null);

      if (el) {
        smoothScrollToElement(el);
      }
    }

    // Wait out SmoothScroll's scroll-to-top retries, which also lets layout and fonts settle
    timerRef.current = setTimeout(executeScroll, DEEP_LINK_SCROLL_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [targetId, altTargetId]);

  return null;
}
