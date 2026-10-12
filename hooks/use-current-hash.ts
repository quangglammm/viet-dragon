"use client";

import { useEffect, useState } from "react";

/**
 * Hook to reactively track window.location.hash across client interactions,
 * popstate and hashchange events.
 */
export function useCurrentHash(): string {
  const [hash, setHash] = useState("");

  useEffect(() => {
    function update() {
      if (typeof window !== "undefined") {
        const raw = window.location.hash.replace(/^#+/, "");
        const clean = raw.split("#")[0]?.trim() || "";
        setHash(clean);
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
