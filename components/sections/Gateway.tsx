"use client";

import { motion } from "motion/react";
import { productCategories } from "@/data/categories";

// Flatten all sub-item Vietnamese names from every category into one marquee string.
const marqueeText =
  productCategories
    .flatMap((c) => c.items.map((i) => i.nameVi.toUpperCase()))
    .join(" · ") + " · ";

const features = [
  {
    icon: "🎨",
    vi: "Thiết kế miễn phí",
    en: "Free design included",
    desc: "Đội ngũ thiết kế chuyên nghiệp hỗ trợ từ ý tưởng đến bản in cuối.",
  },
  {
    icon: "⚡",
    vi: "Giao hàng nhanh",
    en: "Fast turnaround",
    desc: "Sản xuất nhanh, giao tận tay trong vòng 24–48 giờ.",
  },
  {
    icon: "✅",
    vi: "Chất lượng đảm bảo",
    en: "Quality guaranteed",
    desc: "In thử miễn phí — bạn hài lòng 100% mới đặt hàng số lượng lớn.",
  },
];

export default function Gateway() {
  return (
    <section
      id="gateway"
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-white flex flex-col justify-center overflow-hidden py-20 lg:py-0"
    >
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: title */}
        <div>
          <motion.p
            className="text-sm font-semibold text-brand-red tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            Tại Sao Chọn Chúng Tôi · Why Choose Us
          </motion.p>
          <motion.h2
            className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Mọi thứ bạn cần,{" "}
            <span className="text-brand-red">một nơi duy nhất.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-sm text-zinc-400 font-medium"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need, in one place.
          </motion.p>
        </div>

        {/* Right: feature cards */}
        <div className="flex flex-col gap-4">
          {features.map((item, i) => (
            <motion.div
              key={item.vi}
              className="flex gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
            >
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-zinc-900 text-sm">
                  {item.vi}{" "}
                  <span className="font-normal text-zinc-400">/ {item.en}</span>
                </p>
                <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquee — fade mask makes edges transparent, center contrasty */}
      <div
        className="overflow-hidden select-none mt-12 py-6"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        {/* Two copies are required: when the first scrolls off-left the second
            is already in place, so the reset to x=0 is invisible — one loop. */}
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-zinc-500 pr-0">
            {marqueeText}
          </span>
          <span className="text-sm font-semibold tracking-[0.2em] text-zinc-500 pr-0">
            {marqueeText}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
