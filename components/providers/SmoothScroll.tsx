"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Lenis smooth scroll only on desktop — mobile/tablet use native scroll
    // so that IntersectionObserver (whileInView) fires correctly on touch devices.
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis();
    lenisRef.current = lenis;

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
    const hash = window.location.hash;
    const targetEl = hash ? document.getElementById(hash.slice(1)) : null;
    const targetY = targetEl
      ? targetEl.getBoundingClientRect().top +
        window.scrollY -
        (parseFloat(getComputedStyle(targetEl).scrollMarginTop) || 0)
      : 0;

    function apply() {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
    }

    apply();
    const timeoutIds = [50, 150, 300].map((delay) => setTimeout(apply, delay));
    return () => timeoutIds.forEach(clearTimeout);
  }, [pathname]);

  return <>{children}</>;
}
