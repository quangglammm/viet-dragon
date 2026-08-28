"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, EffectFade, Pagination } from "swiper/modules";
import { WipeButton } from "@/components/ui/wipe-button";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const SLIDE_DURATION = 4000;
const slideImages = [
  "/images/hero/slide1.webp",
  "/images/hero/slide2.webp",
  "/images/hero/slide4.webp",
];

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

  return (
    <section
      className="relative w-full overflow-hidden pt-24 pb-10 lg:pt-32 lg:pb-16 transition-[background] duration-700"
      style={{ background: gradients[index] }}
    >
      {/* The gradient itself gives the fixed navbar's white text enough contrast —
          no separate scrim needed (unlike a white/photo hero). */}

      {/* Soft decorative blob, echoing the abstract shape behind the template's
          floating product mockups. */}
      <div className="absolute top-1/3 -right-24 w-[560px] h-[560px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full bg-white/5 blur-3xl" />

      {/* Scattered dot cluster, bottom-left. */}
      {decorDots.map((d) => (
        <span
          key={d.left}
          className="absolute rounded-full bg-white/25"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto w-full px-6">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          loop
          autoplay={{
            delay: SLIDE_DURATION,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          pagination={{ clickable: true }}
          a11y={{ paginationBulletMessage: t("viewSlide", { number: "{{index}}" }) }}
          onSlideChange={(swiper: SwiperInstance) => setIndex(swiper.realIndex)}
          className="hero-swiper"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={slide.tag}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[420px] lg:min-h-[480px]">
                {/* ── Left: slide copy ── */}
                <div className="flex flex-col gap-6 z-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                    {slide.tag}
                  </p>

                  <h1 className="text-[clamp(2.25rem,8vw,3.75rem)] font-black leading-tight tracking-tight text-white line-clamp-2 min-h-[2.5em]">
                    {slide.titleLine1}
                    <span className="hidden sm:inline"> </span>
                    <br className="sm:hidden" />
                    {slide.titleLine2}
                  </h1>

                  <p className="text-[clamp(1rem,4vw,1.125rem)] text-white/75 leading-relaxed max-w-md line-clamp-3 min-h-[4.875em]">
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
                </div>

                {/* ── Right: slide image ── */}
                <div className="relative h-[280px] sm:h-[360px] lg:h-[440px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={slideImages[i]}
                    alt={`${slide.titleLine1} ${slide.titleLine2}`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
