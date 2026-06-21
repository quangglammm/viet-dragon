"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Lenis smooth scroll only on desktop — mobile/tablet use native scroll
    // so that IntersectionObserver (whileInView) fires correctly on touch devices.
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis();

    lenis.on("scroll", ScrollTrigger.update);

    const onFrame = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onFrame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onFrame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
