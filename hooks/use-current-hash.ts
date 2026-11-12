"use client";

import { useEffect, useState } from "react";
import { findHashTarget } from "@/lib/hash-navigation";

/**
 * Hook to reactively track window.location.hash across client interactions,
 * popstate and hashchange events. A hash that is an old or foreign name of a card on the page
 * is reported as that card's canonical id, so callers compare it with canonical links only.
 */
export function useCurrentHash(): string {
  const [hash, setHash] = useState("");

  useEffect(() => {
    function update() {
      if (typeof window !== "undefined") {
        const raw = window.location.hash.replace(/^#+/, "");
        const clean = raw.split("#")[0]?.trim() || "";
        setHash(findHashTarget(clean)?.id ?? clean);
      }
    }

    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);

    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);

  return hash;
}
