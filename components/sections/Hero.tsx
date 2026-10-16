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
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center min-h-[420px] lg:min-h-[480px]">
                {/* ── Left: slide copy ── */}
                <div className="relative flex flex-col gap-6 z-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 relative z-20 [text-shadow:_0_1px_8px_rgba(9,5,47,0.4)]">
                    {slide.tag}
                  </p>

                  <h1 className="text-[clamp(2.25rem,8vw,3.75rem)] font-black leading-tight tracking-tight text-white line-clamp-2 min-h-[2.5em] relative z-20 [text-shadow:_0_2px_16px_rgba(9,5,47,0.7)]">
                    {slide.titleLine1}
                    <span className="hidden sm:inline"> </span>
                    <br className="sm:hidden" />
                    {slide.titleLine2}
                  </h1>

                  <p className="text-[clamp(1rem,4vw,1.125rem)] text-white/95 leading-relaxed max-w-lg relative z-20 [text-shadow:_0_2px_12px_rgba(9,5,47,0.8),_0_1px_4px_rgba(9,5,47,0.8)]">
                    {slide.desc}
                  </p>

                  <div className="relative z-10 mt-2">
                    {/* ── Foreground: Nút Nhận báo giá & Số điện thoại ── */}
                    <div className="relative z-10 flex flex-wrap items-center gap-5 pt-6">
                      <WipeButton href="/#cta" tone="light" size="lg">
                        {t("cta")}
                      </WipeButton>

                      {/* ── Khối Số điện thoại với Logo đặt ngay phía sau ── */}
                      <div className="relative inline-flex items-center">
                        {/* ── Background Logo: Kéo lên 15% (-top-[138px]), cạnh nhọn vừa chạm nút báo giá ── */}
                        <div className="absolute -top-[98px] sm:-top-[121px] lg:-top-[138px] -left-6 sm:-left-7 lg:-left-[29px] w-[224px] sm:w-[280px] lg:w-[320px] pointer-events-none select-none z-0 [filter:drop-shadow(0_20px_35px_rgba(0,0,0,0.4))]">
                          <Image
                            src="/images/hero-landing-plane.webp"
                            alt="Viet Dragon - Airplane Landing"
                            width={690}
                            height={790}
                            priority={i === 0}
                            className="w-full h-auto object-contain opacity-95"
                          />
                        </div>

                        {/* ── Hotline badge: Hiệu ứng rê chuột (hover) màu tím thương hiệu sang trọng ── */}
                        <a
                          href={`tel:${PHONE_NUMBER}`}
                          className="group relative z-20 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white border border-white/25 hover:border-white text-base sm:text-lg font-bold tracking-wide text-white hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(112,0,254,0.45)] backdrop-blur-md cursor-pointer"
                        >
                          <Phone size={18} className="text-white group-hover:text-brand-primary transition-colors duration-300 shrink-0" />
                          <span className="text-white group-hover:text-brand-primary transition-colors duration-300">{tContact("phone1")}</span>
                        </a>
                      </div>
                    </div>
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
