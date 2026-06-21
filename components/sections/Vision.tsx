"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const viBig = ["Chúng tôi", "in mọi thứ", "bạn cần."];

export default function Vision() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="vision"
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-white flex items-center overflow-hidden py-20 lg:py-0"
    >
      {/* Decorative circle */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-zinc-100" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-zinc-100" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full">
        <motion.p
          className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Sứ Mệnh · Our Mission
        </motion.p>

        <div className="flex flex-col gap-2 mb-8">
          {viBig.map((line, i) => (
            <motion.h2
              key={i}
              className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-zinc-900 leading-none tracking-tight"
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {line}
            </motion.h2>
          ))}
        </div>

        <motion.p
          className="text-2xl lg:text-3xl font-light text-zinc-400 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.45 }}
        >
          We print everything you need.
        </motion.p>

        <motion.p
          className="max-w-lg text-zinc-500 text-base leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.55 }}
        >
          Từ danh thiếp nhỏ bé đến hộp giấy sang trọng, từ brochure tinh tế đến
          decal cá tính — mỗi sản phẩm đều mang dấu ấn chất lượng của Viet Dragon.
        </motion.p>
        <motion.p
          className="max-w-lg text-zinc-400 text-sm leading-relaxed mt-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          From tiny business cards to luxurious packaging — every product carries the
          Viet Dragon quality mark.
        </motion.p>
      </div>
    </section>
  );
}
