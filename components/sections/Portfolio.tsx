"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Image from "next/image";

const gridImages = [
  { seed: "pg1", w: 400, h: 300 },
  { seed: "pg2", w: 400, h: 500 },
  { seed: "pg3", w: 400, h: 350 },
  { seed: "pg4", w: 400, h: 450 },
  { seed: "pg5", w: 400, h: 300 },
  { seed: "pg6", w: 400, h: 400 },
];

export default function Portfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const floatY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-brand-warm flex items-center overflow-hidden py-20 lg:py-0"
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <motion.p
            className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Tác Phẩm · Our Work
          </motion.p>
          <motion.h2
            className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Từng sản phẩm,{" "}
            <span className="text-brand-red">từng chi tiết.</span>
          </motion.h2>
          <motion.p
            className="text-zinc-500 leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Chúng tôi tự hào về từng sản phẩm rời khỏi xưởng in. Chất lượng không
            phải là ngẫu nhiên — đó là tiêu chuẩn của chúng tôi.
          </motion.p>
          <motion.p
            className="text-zinc-400 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Every product, every detail — quality is our standard.
          </motion.p>

          <motion.a
            href="/#cta"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 border-2 border-zinc-900 text-zinc-900 font-semibold rounded-full hover:bg-zinc-900 hover:text-white transition-colors text-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            Xem thêm / See more <span aria-hidden>→</span>
          </motion.a>
        </div>

        {/* Mobile/tablet: simple 2×2 image grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mt-2">
          {gridImages.slice(0, 4).map((img, i) => (
            <motion.div
              key={img.seed}
              className="relative rounded-xl overflow-hidden h-28 sm:h-32"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Image
                src={`https://picsum.photos/seed/${img.seed}/${img.w}/${img.h}`}
                alt="Sản phẩm in ấn"
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
          ))}
        </div>

        {/* Desktop: parallax grid + floating image */}
        <div className="relative h-[480px] hidden lg:block overflow-hidden">
          {/* Grid layer */}
          <motion.div
            className="absolute inset-0 grid grid-cols-2 gap-3"
            style={{ y: gridY }}
          >
            {gridImages.map((img, i) => (
              <motion.div
                key={img.seed}
                className="relative rounded-xl overflow-hidden"
                style={{ gridRow: i % 3 === 0 ? "span 2" : "span 1" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
              >
                <Image
                  src={`https://picsum.photos/seed/${img.seed}/${img.w}/${img.h}`}
                  alt="Sản phẩm in ấn"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Floating spotlight image */}
          <motion.div
            ref={floatRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-56 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white z-10"
            style={{ y: floatY }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Image
              src="https://picsum.photos/seed/vdfloat/350/440"
              alt="Sản phẩm nổi bật"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
