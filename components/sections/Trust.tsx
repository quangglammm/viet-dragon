"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { value: "500+", vi: "Khách Hàng", en: "Happy Clients" },
  { value: "10+",  vi: "Năm Kinh Nghiệm", en: "Years of Experience" },
  { value: "100%", vi: "Miễn Phí Tư Vấn", en: "Free Consultation" },
  { value: "24h",  vi: "Giao Hàng Nhanh", en: "Fast Delivery" },
];

export default function Trust() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="scroll-panel relative min-h-screen lg:h-screen w-full bg-brand-dark flex items-center overflow-hidden py-20 lg:py-0">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:32px_32px]" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full">
        <motion.p
          className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Con Số Nói Lên Tất Cả · Numbers Don&apos;t Lie
        </motion.p>

        <motion.h2
          className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8 lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          Được tin tưởng bởi{" "}
          <span className="text-brand-red">hàng trăm doanh nghiệp.</span>
          <br />
          <span className="text-white/40 text-3xl lg:text-4xl font-medium">
            Trusted by hundreds of businesses.
          </span>
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.25 + i * 0.1 }}
            >
              <span className="text-5xl lg:text-6xl font-black text-white">
                {s.value}
              </span>
              <span className="text-white font-semibold text-lg">{s.vi}</span>
              <span className="text-white/40 text-sm">{s.en}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
