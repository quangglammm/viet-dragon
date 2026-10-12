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

const SCROLL_DURATION_S = 0.8;

/**
 * After a route change without a hash, SmoothScroll re-applies "scroll to top"
 * at these delays to outlast leftover wheel momentum. Anything that scrolls on
 * arrival without a URL hash (deep links like /…/backlit-film) must start after
 * this window, or the retries yank the page back to the top mid-glide.
 */
export const TOP_RESET_RETRY_MS = [50, 150, 300];
export const DEEP_LINK_SCROLL_DELAY_MS = Math.max(...TOP_RESET_RETRY_MS) + 50;

/**
 * Resolves a URL hash (with or without "#") to its target element, falling back
 * to the canonical shape id when the hash is an alias (e.g. "flyer-budget").
 */
export function findHashTarget(hash: string): HTMLElement | null {
  const id = hash.replace(/^#+/, "").split("#")[0]?.trim();
  if (!id) return null;
  return document.getElementById(id) ?? document.getElementById(SHAPE_ALIASES[id] ?? "");
}

/**
 * Document Y that places `el` just below the fixed header. The header offset
 * comes solely from the target's CSS `scroll-margin-top` — never add a second
 * offset on top, Lenis and the browser would otherwise stack both.
 */
export function getElementScrollTop(el: HTMLElement): number {
  const scrollMargin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - scrollMargin);
}

/**
 * Scrolls to an absolute Y through Lenis when active (desktop), or the native
 * scroller otherwise (mobile/tablet). Real DOM measurements are used for the
 * target, not Lenis's lagging internal bookkeeping.
 */
export function scrollToY(top: number, immediate = false) {
  if (typeof window === "undefined") return;
  const lenis = window.__lenis;
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(top, immediate ? { immediate: true } : { duration: SCROLL_DURATION_S });
  } else {
    window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
  }
}

export function smoothScrollToElement(el: HTMLElement | null) {
  if (!el) return;
  scrollToY(getElementScrollTop(el));
}

/**
 * Safely navigates to a hash on the current page without reloading or creating chained hashes.
 * If target is on the same page:
 * - Prevents default Next.js Link behavior
 * - Replaces/pushes the clean single hash URL
 * - Fires a hashchange event — SmoothScroll is the single listener that scrolls
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

    // A missing hash (category/group header link) resolves to scroll-to-top
    window.history.pushState(null, "", targetHash ? `${cleanBase}#${targetHash}` : cleanBase);
    window.dispatchEvent(new Event("hashchange"));

    return true;
  }

  return false;
}
