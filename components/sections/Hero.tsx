"use client";

import { motion } from "motion/react";
import Image from "next/image";

const headline = ["In", "ấn", "đẳng", "cấp,", "chuyên", "nghiệp."];

// Cards share the same bottom-center anchor; rotation fans them out.
// originY: 1 means each card rotates around its own bottom center,
// so all five pivot from the same fixed point — a true hand-of-cards fan.
const cards = [
  { id: 1, label: "Danh Thiếp",    en: "Business Cards",       seed: "vdc1", rotate: -22, zIndex: 1, delay: 0.55 },
  { id: 2, label: "Catalogue",     en: "Catalogue & Brochure", seed: "vdc2", rotate: -11, zIndex: 2, delay: 0.68 },
  { id: 3, label: "Hộp Giấy",     en: "Packaging",            seed: "vdc3", rotate:   0, zIndex: 3, delay: 0.81 },
  { id: 4, label: "Decal & Nhãn", en: "Stickers & Labels",    seed: "vdc4", rotate:  11, zIndex: 4, delay: 0.94 },
  { id: 5, label: "Lịch / Sổ Tay",en: "Calendar & Notebook",  seed: "vdc5", rotate:  22, zIndex: 5, delay: 1.07 },
];

const CARD_W = 220;
const CARD_H = 340;

export default function Hero() {
  return (
    <section className="scroll-panel relative flex min-h-screen lg:h-screen w-full items-center bg-white overflow-hidden pt-20 pb-12 lg:pt-16 lg:pb-0">
      <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* ── Left: text ── */}
        <div className="flex flex-col gap-6 z-10">
          <motion.span
            className="inline-flex items-center gap-2 self-start px-4 py-1.5 bg-zinc-100 text-zinc-500 text-[10px] font-semibold rounded-full tracking-wide uppercase whitespace-nowrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
            In Ấn Chuyên Nghiệp · TP. HCM &amp; Bình Dương
          </motion.span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-zinc-900">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-[0.2em] ${i >= headline.length - 2 ? "text-brand-red" : ""}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
              Từ danh thiếp tinh tế đến bộ nhận diện thương hiệu hoàn chỉnh —
              chúng tôi biến ý tưởng thành sản phẩm in ấn chất lượng cao.
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              From business cards to full brand identity — we make ideas print-ready.
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <a
              href="/#cta"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-semibold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-brand-red/20"
            >
              Nhận báo giá <span aria-hidden>→</span>
            </a>
            <a href="tel:0901448377" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
              0901 448 377
            </a>
          </motion.div>

          {/* ── Mobile card strip (inside text column to avoid flex-row collision) ── */}
          <div className="md:hidden overflow-x-auto flex gap-3 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className="relative shrink-0 w-36 h-48 rounded-2xl overflow-hidden shadow-lg snap-start"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: card.delay - 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={`https://picsum.photos/seed/${card.seed}/440/680`}
                  alt={card.label}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white font-bold text-xs">{card.label}</p>
                  <p className="text-white/60 text-[10px]">{card.en}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Right: hand-of-cards fan (tablet and desktop) ── */}
        <div className="relative hidden md:block" style={{ height: 500 }}>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: "50%",
                bottom: 32,
                marginLeft: -CARD_W / 2,
                zIndex: card.zIndex,
                originX: 0.5,
                originY: 1,
              }}
              initial={{ x: 640, rotate: card.rotate + 28, opacity: 0 }}
              animate={{ x: 0, rotate: card.rotate, opacity: 1 }}
              transition={{ duration: 0.85, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -28, zIndex: 20, transition: { duration: 0.2, ease: "easeOut" } }}
            >
              <Image
                src={`https://picsum.photos/seed/${card.seed}/440/680`}
                alt={card.label}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-bold text-sm">{card.label}</p>
                <p className="text-white/60 text-xs">{card.en}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase">Cuộn xuống</span>
        <motion.div
          className="w-px h-8 bg-zinc-300 origin-top"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
