"use client";

import { useEffect } from "react";

interface AutoScrollToTargetProps {
  readonly targetId?: string;
  readonly altTargetId?: string;
}

export function AutoScrollToTarget({
  targetId,
  altTargetId,
}: AutoScrollToTargetProps) {
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
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Initial tick & follow-up after images/fonts settle
    const timer1 = setTimeout(executeScroll, 120);
    const timer2 = setTimeout(executeScroll, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [targetId, altTargetId]);

  return null;
}
