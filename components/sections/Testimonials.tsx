"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Pagination } from "swiper/modules";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";

import "swiper/css";
import "swiper/css/pagination";

const SLIDE_DURATION = 4000;
const seeds = ["vdt1", "vdt2", "vdt3"];

type Testimonial = { name: string; role: string; quote: string };

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const testimonials = t.raw("items") as Testimonial[];

  return (
    <section
      id="testimonials"
      className="relative w-full bg-brand-soft overflow-hidden py-14 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          className="text-center mb-12"
        />

        <Swiper
          modules={[Autoplay, Pagination, A11y]}
          slidesPerView={1}
          spaceBetween={24}
          loop
          autoplay={{
            delay: SLIDE_DURATION,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ clickable: true, bulletClass: "dot-nav-item", bulletActiveClass: "is-active" }}
          a11y={{ paginationBulletMessage: t("viewReview", { number: "{{index}}" }) }}
          className="testimonials-swiper"
        >
          {testimonials.map((tItem, i) => {
            const seed = seeds[i % seeds.length];
            return (
              <SwiperSlide key={tItem.name}>
                <div className="flex h-full flex-col gap-5 bg-white rounded-2xl p-8 border border-zinc-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        <AvatarImage src={`https://picsum.photos/seed/${seed}/80/80`} alt={tItem.name} loading="lazy" />
                        <AvatarFallback>{tItem.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-bold text-zinc-900 text-sm">{tItem.name}</p>
                        <p className="text-zinc-400 text-xs">{tItem.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={14} className="fill-[#ecb332] text-[#ecb332]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed text-left">
                    &ldquo;{tItem.quote}&rdquo;
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
