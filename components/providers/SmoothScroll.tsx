"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export default function SmoothScroll({ children }: Readonly<{ children: React.ReactNode }>) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Lenis smooth scroll only on desktop — mobile/tablet use native scroll
    // so that IntersectionObserver (whileInView) fires correctly on touch devices.
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis();
    lenisRef.current = lenis;
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
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, []);

  // Lenis mounts once here in the root layout and survives every client-side
  // route change (only `children` swaps under it), so its own momentum can
  // outlive the page it started on. If wheel momentum is still decaying when
  // a route change lands on a *shorter* page, the browser clamps the scroll
  // to the new page's max height, Lenis's own (debounced) limit recalc
  // adopts that clamp as "settled", and the leftover momentum keeps nudging
  // the scroll for a bit even after we reset it — landing the new page
  // stuck mid-scroll instead of at the top. Re-applying the reset a few
  // times over the following ~300ms (rather than once) reliably outlasts
  // that decay; a single immediate correction alone loses that race
  // intermittently. Real DOM measurements are used for the target (not
  // Lenis's own animatedScroll bookkeeping, which lags mid-transition).
  useEffect(() => {
    function apply(immediate = false) {
      const hash = window.location.hash;
      const targetEl = hash ? document.getElementById(hash.slice(1)) : null;
      const targetY = targetEl
        ? targetEl.getBoundingClientRect().top +
          window.scrollY -
          (parseFloat(getComputedStyle(targetEl).scrollMarginTop) || 0)
        : 0;

      const lenis = lenisRef.current;
      if (lenis) {
        lenis.resize();
        if (immediate) {
          lenis.scrollTo(targetY, { immediate: true });
        } else {
          lenis.scrollTo(targetY, { duration: 0.8 });
        }
      } else {
        window.scrollTo({ top: targetY, behavior: immediate ? "instant" : "smooth" });
      }
    }

    apply(true);
    const timeoutIds = [50, 150, 300].map((delay) => setTimeout(() => apply(true), delay));

    function handleHashChange() {
      apply(false);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      timeoutIds.forEach(clearTimeout);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  return <>{children}</>;
}
