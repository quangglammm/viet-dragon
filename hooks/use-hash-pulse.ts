import { useState, useEffect, useRef } from "react";

export function useHashPulse<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const checkAndPulse = (hash: string) => {
      if (!hash) return;
      const section = ref.current?.closest("section");
      if (section && `#${section.id}` === hash) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              setTimeout(() => {
                setPulse(true);
                setTimeout(() => setPulse(false), 300);
              }, 300);
              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );
        observer.observe(section);
        setTimeout(() => observer.disconnect(), 2500);
      }
    };

    // 1. Check on mount (for cross-page navigation)
    checkAndPulse(window.location.hash);

    // 2. Intercept clicks (for same-page Next.js Link navigation)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target?.href) return;
      try {
        const url = new URL(target.href);
        if (url.hash && (url.pathname === window.location.pathname || url.pathname === window.location.pathname + '/')) {
          if (window.location.hash === url.hash) {
            // Prevent Next.js from doing a hard reload when clicking the exact same URL
            e.preventDefault();
            const sectionTarget = document.querySelector(url.hash);
            if (sectionTarget) {
              sectionTarget.scrollIntoView({ behavior: 'smooth' });
            }
          }
          checkAndPulse(url.hash);
        }
      } catch {
        // Ignore URL parsing errors
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return { ref, pulse };
}
