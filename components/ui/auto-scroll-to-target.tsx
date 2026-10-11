"use client";

import { useEffect, useRef } from "react";
import { smoothScrollToElement } from "@/lib/hash-navigation";

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
    const currentHash = window.location.hash.replace(/^#/, "").trim();
    const rawId = currentHash || targetId || altTargetId;
    if (!rawId) return;
    const idToScroll: string = rawId;

    function executeScroll() {
      const el =
        document.getElementById(idToScroll) ||
        (altTargetId ? document.getElementById(altTargetId) : null) ||
        (targetId ? document.getElementById(targetId) : null);

      if (el) {
        smoothScrollToElement(el);
      }
    }

    // Settled execution after layout and fonts stabilize
    timerRef.current = setTimeout(executeScroll, 150);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [targetId, altTargetId]);

  return null;
}
