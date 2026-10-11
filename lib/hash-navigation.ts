// lib/hash-navigation.ts
// Utility to handle safe hash navigation on shapes and avoid Next.js fragment duplication

import type React from "react";
import { SHAPE_ALIASES } from "@/lib/shape-aliases";

/**
 * Normalizes a pathname by stripping query params, locale prefix (/vi, /en, etc.), and trailing slash.
 */
function normalizePathname(path: string): string {
  if (!path) return "";
  const cleaned = path.split("?")[0].replace(/^\/(vi|en|zh|ja|ko)(?=\/|$)/, "");
  return cleaned === "" ? "/" : cleaned.replace(/\/+$/, "");
}

/**
 * Safely navigates to a hash on the current page without reloading or creating chained hashes.
 * If target is on the same page:
 * - Prevents default Next.js Link behavior
 * - Replaces/pushes the clean single hash URL
 * - Fires events and smoothly scrolls to the element
 * Returns true if handled in-page, false if navigation is cross-page.
 */
export function navigateToShapeHash(targetHref: string, e?: React.MouseEvent): boolean {
  if (typeof window === "undefined" || !targetHref) return false;

  const [rawTargetPath, targetHash] = targetHref.split("#");
  const currentPath = normalizePathname(window.location.pathname);
  const targetPath = normalizePathname(rawTargetPath);

  if (currentPath === targetPath) {
    if (e) {
      e.preventDefault();
    }

    const cleanBase = window.location.pathname + window.location.search;

    if (targetHash) {
      const cleanUrl = `${cleanBase}#${targetHash}`;
      window.history.pushState(null, "", cleanUrl);
      window.dispatchEvent(new Event("hashchange"));
      window.dispatchEvent(new Event("shape-select"));

      const elementId = SHAPE_ALIASES[targetHash] || targetHash;
      const el = document.getElementById(elementId) || document.getElementById(targetHash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // User clicked a category/group header without hash on the same page
      window.history.pushState(null, "", cleanBase);
      window.dispatchEvent(new Event("hashchange"));
      window.dispatchEvent(new Event("shape-select"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return true;
  }

  return false;
}
