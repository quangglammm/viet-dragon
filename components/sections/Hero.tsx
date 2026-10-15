"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay, EffectFade, Pagination } from "swiper/modules";
import { WipeButton } from "@/components/ui/wipe-button";
import { motion } from "motion/react";

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

interface SlideLogoConfig {
  containerClass: string;
  shadowClass: string;
  initial: { opacity: number; x: number; y: number; rotate: number; scale: number };
  animate: { opacity: number; x: number; y: number; rotate: number; scale: number };
  inactive: { opacity: number; x: number; y: number; rotate: number; scale: number };
  duration: number;
}

const slideLogoConfigs: readonly SlideLogoConfig[] = [
  // Slide 1: In ấn đẳng cấp — Tỷ lệ 30% (tiếp cận từ xa, kích thước 30%, nghiêng nhẹ -8°, lướt nhẹ)
  {
    containerClass:
      "absolute top-3 lg:top-4 -left-10 sm:-left-14 lg:-left-[75px] w-[110px] sm:w-[120px] lg:w-[130px] pointer-events-none select-none z-0",
    shadowClass:
      "absolute bottom-2 right-2 sm:right-3 w-10 h-3.5 bg-black/20 blur-md rounded-full scale-y-40 -rotate-2",
    initial: { opacity: 0, x: -12, y: -6, rotate: -3, scale: 0.95 },
    animate: { opacity: 0.82, x: 0, y: 0, rotate: -8, scale: 1 },
    inactive: { opacity: 0, x: -8, y: -4, rotate: -3, scale: 0.95 },
    duration: 0.85,
  },
  // Slide 2: Bao bì chuẩn thương hiệu — Tỷ lệ 50% (hạ độ cao trung gian, kích thước 50%, nghiêng -11°, lướt tầm trung)
  {
    containerClass:
      "absolute top-4 lg:top-5 -left-18 sm:-left-26 lg:-left-[135px] w-[180px] sm:w-[200px] lg:w-[215px] pointer-events-none select-none z-0",
    shadowClass:
      "absolute bottom-2 right-3 sm:right-4 w-18 h-6 bg-black/32 blur-lg rounded-full scale-y-45 -rotate-4",
    initial: { opacity: 0, x: -22, y: -11, rotate: -5, scale: 0.95 },
    animate: { opacity: 0.9, x: 0, y: 0, rotate: -11, scale: 1 },
    inactive: { opacity: 0, x: -14, y: -7, rotate: -5, scale: 0.95 },
    duration: 1.0,
  },
  // Slide 3: Giao hàng nhanh 48h — Tỷ lệ 70% (hạ cánh tiếp đất, kích thước 70%, nghiêng -14°, đáp xuống ngay trên nút Báo giá)
  {
    containerClass:
      "absolute top-7 lg:top-7 -left-28 sm:-left-40 lg:-left-[192px] w-[250px] sm:w-[280px] lg:w-[295px] pointer-events-none select-none z-0",
    shadowClass:
      "absolute bottom-2 right-4 sm:right-6 w-28 h-9 bg-black/45 blur-lg rounded-full scale-y-45 -rotate-6",
    initial: { opacity: 0, x: -32, y: -16, rotate: -6, scale: 0.95 },
    animate: { opacity: 0.95, x: 0, y: 0, rotate: -14, scale: 1 },
    inactive: { opacity: 0, x: -20, y: -10, rotate: -6, scale: 0.95 },
    duration: 1.1,
  },
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
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[420px] lg:min-h-[480px]">
                {/* ── Left: slide copy ── */}
                <div className="relative flex flex-col gap-6 z-10">
                  {/* ── Overlay: 3D Airplane-Landing Logo & Shadow (Tiến trình chuyển slide) ── */}
                  {slideLogoConfigs[i] && (
                    <motion.div
                      key={`landing-logo-${i}-${index}`}
                      initial={slideLogoConfigs[i].initial}
                      animate={index === i ? slideLogoConfigs[i].animate : slideLogoConfigs[i].inactive}
                      transition={{ duration: slideLogoConfigs[i].duration, ease: [0.16, 1, 0.3, 1] }}
                      className={slideLogoConfigs[i].containerClass}
                    >
                      {/* Airplane Ground Touchdown Shadow (tăng dần kích thước & độ đậm theo tiến độ tiếp đất) */}
                      <div
                        className={slideLogoConfigs[i].shadowClass}
                        aria-hidden="true"
                      />

                      {/* Logo nguyên vẹn 100%, độ nghiêng và khoảng cách lớn dần theo từng slide */}
                      <div className="relative [filter:drop-shadow(0_14px_22px_rgba(0,0,0,0.45))_drop-shadow(0_30px_40px_rgba(9,5,47,0.35))]">
                        <Image
                          src="/logo-icon.webp"
                          alt="Viet Dragon Airplane Landing Emblem"
                          width={580}
                          height={626}
                          priority={i === 0}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </motion.div>
                  )}

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 relative z-10 [text-shadow:_0_1px_8px_rgba(9,5,47,0.4)]">
                    {slide.tag}
                  </p>

                  <h1 className="text-[clamp(2.25rem,8vw,3.75rem)] font-black leading-tight tracking-tight text-white line-clamp-2 min-h-[2.5em] relative z-10 [text-shadow:_0_2px_16px_rgba(9,5,47,0.6)]">
                    {slide.titleLine1}
                    <span className="hidden sm:inline"> </span>
                    <br className="sm:hidden" />
                    {slide.titleLine2}
                  </h1>

                  <p className="text-[clamp(1rem,4vw,1.125rem)] text-white/85 leading-relaxed max-w-md line-clamp-3 min-h-[4.875em] relative z-10 [text-shadow:_0_1px_8px_rgba(9,5,47,0.5)]">
                    {slide.desc}
                  </p>

                  <div className="flex items-center gap-4 mt-2 relative z-10">
                    <WipeButton href="/#cta" tone="light" size="lg">
                      {t("cta")}
                    </WipeButton>
                    <a href="tel:0901448377" className="text-sm text-white/80 hover:text-white transition-colors [text-shadow:_0_1px_6px_rgba(9,5,47,0.4)]">
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
