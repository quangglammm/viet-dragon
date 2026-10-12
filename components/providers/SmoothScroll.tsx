"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";
import { TOP_RESET_RETRY_MS, findHashTarget, getElementScrollTop, scrollToY } from "@/lib/hash-navigation";

const HASH_SETTLE_MS = 150;
const HASH_CHANGE_DELAY_MS = 50;
const HASH_WAIT_MAX_MS = 1500;

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

/** Empty hash scrolls to the top; a hash that matches no element is ignored. */
function scrollToHash(hash: string, immediate = false) {
  if (!hash.replace(/^#+/, "")) {
    scrollToY(0, immediate);
    return;
  }
  const el = findHashTarget(hash);
  if (el) scrollToY(getElementScrollTop(el), immediate);
}

export default function SmoothScroll({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const lastPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Lenis smooth scroll only on desktop — mobile/tablet use native scroll
    // so that IntersectionObserver (whileInView) fires correctly on touch devices.
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis();
    window.__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  // Lenis mounts once here in the root layout and survives every client-side
  // route change (only `children` swaps under it), so its own momentum can
  // outlive the page it started on. If wheel momentum is still decaying when
  // a route change lands on a *shorter* page, the browser clamps the scroll
  // to the new page's max height and the leftover momentum keeps nudging the
  // scroll, landing the new page stuck mid-scroll instead of at the top.
  // Re-applying the reset a few times over the following ~300ms (rather than
  // once) reliably outlasts that decay.
  //
  // This effect and the hashchange listener below are the ONLY code that
  // scrolls in response to a hash — navigateToShapeHash and the page
  // components just change the URL, so there is one scroll animation per
  // navigation instead of several competing ones.
  useEffect(() => {
    // Compare against the previous pathname rather than a "first run" flag:
    // StrictMode re-runs this effect with refs intact, so a flag would make the
    // dev-only second run mistake a hard load for a client-side route change.
    const isFirstLoad = lastPathnameRef.current === null || lastPathnameRef.current === pathname;
    lastPathnameRef.current = pathname;
    const hash = window.location.hash;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let rafId = 0;

    if (hash) {
      // Hard load: land on the target directly. Client-side route change: the
      // new page starts at the top, then glides to the target once.
      if (!isFirstLoad) scrollToY(0, true);
      const startedAt = performance.now();
      const waitForTarget = () => {
        if (findHashTarget(hash)) {
          timeoutIds.push(setTimeout(() => scrollToHash(hash, isFirstLoad), HASH_SETTLE_MS));
        } else if (performance.now() - startedAt < HASH_WAIT_MAX_MS) {
          rafId = requestAnimationFrame(waitForTarget);
        }
      };
      waitForTarget();
    } else {
      scrollToY(0, true);
      for (const delay of TOP_RESET_RETRY_MS) {
        timeoutIds.push(setTimeout(() => scrollToY(0, true), delay));
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      timeoutIds.forEach(clearTimeout);
    };
  }, [pathname]);

  useEffect(() => {
    // Measure after the page has re-rendered for the new hash (e.g. a
    // highlighted card reflows its neighbours) so the target Y is not stale.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handleHashChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => scrollToHash(window.location.hash), HASH_CHANGE_DELAY_MS);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return <>{children}</>;
}
