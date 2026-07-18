"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const SLIDE_DURATION = 4000;
const seeds = ["vdt1", "vdt2", "vdt3"];

type Testimonial = { name: string; role: string; quote: string };

function cardsPerViewFor(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);
  const t = useTranslations("testimonials");
  const testimonials = t.raw("items") as Testimonial[];

  useEffect(() => {
    const compute = () => setCardsPerView(cardsPerViewFor(window.innerWidth));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSliding(true), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [paused]);

  // Template shows several testimonial cards at once, sliding one card at a time
  // in a continuous loop. We render one buffer slot past `cardsPerView`, animate
  // the track left by exactly one card width, then — once settled — snap the
  // track back to 0 while advancing `page`, so the loop reads as seamless.
  const slots = Array.from(
    { length: cardsPerView + 1 },
    (_, i) => testimonials[(page + i) % testimonials.length]
  );

  const goTo = (i: number) => {
    setSliding(false);
    setPage(i % testimonials.length);
  };

  return (
    <section
      id="testimonials"
      className="relative w-full bg-brand-soft overflow-hidden py-14 lg:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          className="text-center mb-12"
        />

        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: sliding ? `-${100 / cardsPerView}%` : "0%" }}
            transition={{ duration: sliding ? 0.7 : 0, ease: [0.25, 0.1, 0.25, 1] }}
            onAnimationComplete={() => {
              if (sliding) {
                setPage((p) => (p + 1) % testimonials.length);
                setSliding(false);
              }
            }}
          >
            {slots.map((tItem, i) => {
              const seed = seeds[(page + i) % seeds.length];
              return (
                <div
                  key={i}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
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
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((tm, i) => (
            <button
              key={tm.name}
              onClick={() => goTo(i)}
              aria-label={t("viewReview", { number: i + 1 })}
              className={cn("dot-nav-item", i === page && "is-active")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
