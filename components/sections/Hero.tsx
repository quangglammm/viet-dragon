"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, EffectFade, Pagination } from "swiper/modules";
import { WipeButton } from "@/components/ui/wipe-button";
import { Phone } from "lucide-react";
import { PHONE_NUMBER } from "@/lib/contact";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const SLIDE_DURATION = 4000;
const slideImages = [
  "/images/hero/mayinoffset.webp",
  "/images/hero/mayinnhanh.webp",
  "/images/hero/mayinngoaitroi.webp",
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
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start min-h-[440px] lg:min-h-[480px]">
                {/* ── Left: slide copy ── */}
                <div className="relative flex flex-col gap-3 sm:gap-4 lg:gap-5 z-10">
                  {/* Fixed-height tag container */}
                  <div className="h-6 flex items-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 [text-shadow:_0_1px_8px_rgba(9,5,47,0.4)]">
                      {slide.tag}
                    </p>
                  </div>

                  {/* Fixed-height title container */}
                  <div className="h-[4.25rem] sm:h-[5.25rem] lg:h-[7.25rem] flex flex-col justify-start">
                    <h1 className="text-[clamp(1.5rem,4vw,1.85rem)] sm:text-3xl lg:text-5xl font-black leading-tight tracking-tight text-white [text-shadow:_0_2px_16px_rgba(9,5,47,0.7)]">
                      {slide.titleLine1}
                      <br />
                      {slide.titleLine2}
                    </h1>
                  </div>

                  {/* Fixed-height description container */}
                  <div className="h-[88px] sm:h-[84px] lg:h-[88px] flex items-start overflow-hidden">
                    <p className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-lg [text-shadow:_0_2px_12px_rgba(9,5,47,0.8),_0_1px_4px_rgba(9,5,47,0.8)]">
                      {slide.desc}
                    </p>
                  </div>

                  {/* ── Action row: CTAs ── */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2 lg:pt-3">
                    <WipeButton href="/#cta" tone="light" size="lg">
                      {t("cta")}
                    </WipeButton>

                    <a
                      href={`tel:${PHONE_NUMBER}`}
                      className="group inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white border border-white/25 hover:border-white text-base font-bold tracking-wide text-white hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(112,0,254,0.45)] backdrop-blur-md cursor-pointer shrink-0"
                    >
                      <Phone size={18} className="text-white group-hover:text-brand-primary transition-colors duration-300 shrink-0" />
                      <span className="text-white group-hover:text-brand-primary transition-colors duration-300">{tContact("phone1")}</span>
                    </a>
                  </div>
                </div>

                {/* ── Right: slide image (scaled down on mobile, shifted down 8% on mobile) ── */}
                <div className="relative w-full h-[190px] sm:h-[260px] lg:h-[420px] xl:h-[440px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl mt-[15px] sm:mt-[21px] lg:mt-0">
                  <Image
                    src={slideImages[i]}
                    alt={`${slide.titleLine1} ${slide.titleLine2}`}
                    fill
                    priority={i === 0}
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
