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
      className="relative w-full overflow-x-clip pt-24 pb-10 lg:pt-32 lg:pb-16 transition-[background] duration-700"
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
          className="hero-swiper !overflow-visible"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={slide.tag} className="!overflow-visible">
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

                  {/* Fixed-height description container — sized to slide 3 on mobile (h-[88px] prevents 4th line cut off), layered above logo (z-20) */}
                  <div className="h-[88px] sm:h-[84px] lg:h-[88px] flex items-start overflow-hidden relative z-20">
                    <p className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-lg [text-shadow:_0_2px_12px_rgba(9,5,47,0.8),_0_1px_4px_rgba(9,5,47,0.8)]">
                      {slide.desc}
                    </p>
                  </div>

                  {/* ── Action row: CTAs + Airplane Logo ── */}
                  <div className="relative z-10 pt-0 sm:pt-2 lg:pt-3">
                    {/* ── MOBILE / TABLET (< 1024px): Buttons left (z-20), Logo overflows outside frame freely without clipping ── */}
                    <div className="relative flex lg:hidden items-start">
                      {/* Left: Buttons — foreground layer z-20 */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 shrink-0 relative z-20">
                        <WipeButton href="/#cta" tone="light" size="md">
                          {t("cta")}
                        </WipeButton>

                        <a
                          href={`tel:${PHONE_NUMBER}`}
                          className="group relative inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white border border-white/25 hover:border-white text-sm sm:text-base font-bold tracking-wide text-white hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(112,0,254,0.45)] backdrop-blur-md cursor-pointer shrink-0"
                        >
                          <Phone size={16} className="text-white group-hover:text-brand-primary transition-colors duration-300 shrink-0" />
                          <span className="text-white group-hover:text-brand-primary transition-colors duration-300">{tContact("phone1")}</span>
                        </a>
                      </div>

                      {/* Right/Background: Logo unconstrained, mobile pulled up by 20% */}
                      <div className="absolute -top-[112px] sm:-top-[120px] -right-[12px] sm:-right-[8px] w-[250px] sm:w-[300px] pointer-events-none select-none z-0 [filter:drop-shadow(0_16px_32px_rgba(0,0,0,0.4))]">
                        <Image
                          src="/images/hero-landing-plane.webp"
                          alt="Viet Dragon - Airplane Landing"
                          width={1042}
                          height={907}
                          sizes="(max-width: 640px) 250px, 300px"
                          priority={i === 0}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </div>

                    {/* ── DESKTOP (≥ 1024px): Adjusted down by 13% ── */}
                    <div className="hidden lg:flex items-center gap-5 pt-3">
                      <WipeButton href="/#cta" tone="light" size="lg" className="relative z-20">
                        {t("cta")}
                      </WipeButton>

                      <div className="relative inline-flex items-center">
                        {/* Background Logo: Adjusted down by 13% */}
                        <div className="absolute -top-[95px] xl:-top-[104px] left-[10px] xl:left-[25px] w-[340px] xl:w-[380px] pointer-events-none select-none z-0 [filter:drop-shadow(0_20px_35px_rgba(0,0,0,0.4))]">
                          <Image
                            src="/images/hero-landing-plane.webp"
                            alt="Viet Dragon - Airplane Landing"
                            width={1042}
                            height={907}
                            sizes="(min-width: 1280px) 380px, 340px"
                            priority={i === 0}
                            className="w-full h-auto object-contain opacity-95"
                          />
                        </div>

                        {/* Hotline badge: Foreground layer above logo */}
                        <a
                          href={`tel:${PHONE_NUMBER}`}
                          className="group relative z-20 inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/15 hover:bg-white border border-white/25 hover:border-white text-base font-bold tracking-wide text-white hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(112,0,254,0.45)] backdrop-blur-md cursor-pointer"
                        >
                          <Phone size={18} className="text-white group-hover:text-brand-primary transition-colors duration-300 shrink-0" />
                          <span className="text-white group-hover:text-brand-primary transition-colors duration-300">{tContact("phone1")}</span>
                        </a>
                      </div>
                    </div>
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
