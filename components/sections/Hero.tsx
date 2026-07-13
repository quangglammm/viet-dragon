"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WipeButton } from "@/components/ui/wipe-button";
import { cn } from "@/lib/utils";

const SLIDE_DURATION = 6000;
const seeds = ["vd-hero-1", "vd-hero-2", "vd-hero-3"];

// Template's actual hero is a full-bleed saturated gradient (not a photo), alternated
// per slide — built from this project's existing brand tokens rather than the
// template's literal blue/teal hex values, to stay on-brand.
const gradients = [
  "linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-primary) 100%)",
  "var(--gradient-brand)",
  "linear-gradient(135deg, var(--brand-primary) 0%, #ae34e8 100%)",
];

// Scattered dot decoration echoing the template's bottom-left dot cluster.
const decorDots = [
  { left: "8%", top: "58%", size: 10 },
  { left: "18%", top: "72%", size: 14 },
  { left: "4%", top: "82%", size: 8 },
  { left: "26%", top: "62%", size: 8 },
  { left: "14%", top: "90%", size: 10 },
  { left: "32%", top: "84%", size: 6 },
];

type Slide = { tag: string; titleLine1: string; titleLine2: string; desc: string };

export default function Hero() {
  const t = useTranslations("hero");
  const tContact = useTranslations("contact");
  const slides = t.raw("slides") as Slide[];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => setIndex(i % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  const slide = slides[index];
  const seed = seeds[index];

  return (
    <section
      className="relative w-full overflow-hidden pt-28 pb-14 lg:pt-40 lg:pb-20 transition-[background] duration-700"
      style={{ background: gradients[index] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* The gradient itself gives the fixed navbar's white text enough contrast —
          no separate scrim needed (unlike a white/photo hero). */}

      {/* Soft decorative blob, echoing the abstract shape behind the template's
          floating product mockups. */}
      <div className="absolute top-1/3 -right-24 w-[560px] h-[560px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full bg-white/5 blur-3xl" />

      {/* Scattered dot cluster, bottom-left. */}
      {decorDots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/25"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto w-full px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[420px] lg:min-h-[480px]">
          {/* ── Left: slide copy ── */}
          {/* Reveal choreography mirrors the template's hero-3: content falls in from
              above while the image (below) rises from below — opposing directions that
              converge into place, on a slower transition than the crossfade itself. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="flex flex-col gap-6 z-10"
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                {slide.tag}
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                {slide.titleLine1}
                <br />
                {slide.titleLine2}
              </h1>

              <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-md">
                {slide.desc}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <WipeButton href="/#cta" tone="light" size="lg">
                  {t("cta")}
                </WipeButton>
                <a href="tel:0901448377" className="text-sm text-white/70 hover:text-white transition-colors">
                  {tContact("phone1")}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Right: slide image ── */}
          <div className="relative h-[280px] sm:h-[360px] lg:h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Image
                  src={`https://picsum.photos/seed/${seed}/1000/900`}
                  alt={`${slide.titleLine1} ${slide.titleLine2}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Dot navigation ── */}
        {/* Ring-style pagination, mirroring the template's swiper-dot-2: solid fill
            when inactive, hollow ring when active — an inverted convention from the
            usual "active dot fills in" pattern. */}
        <div className="flex items-center gap-3 mt-10 lg:mt-14">
          {slides.map((s, i) => (
            <button
              key={s.tag}
              onClick={() => goTo(i)}
              aria-label={t("viewSlide", { number: i + 1 })}
              className={cn(
                "h-3 w-3 rounded-full border-2 transition-all duration-500",
                i === index
                  ? "bg-transparent border-white scale-110"
                  : "bg-white/70 border-white/70 hover:border-white",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
