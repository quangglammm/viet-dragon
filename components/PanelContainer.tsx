"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PanelContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only apply cover-pin effect on desktop — on mobile sections scroll naturally
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>(".scroll-panel", ref.current);
        panels.forEach((panel, i) => {
          if (i < panels.length - 1) {
            ScrollTrigger.create({
              trigger: panel,
              start: "top top",
              pin: true,
              pinSpacing: false,
            });
          }
        });
      }, ref);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
