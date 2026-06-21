"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="cta"
      className="relative min-h-screen w-full bg-brand-red flex items-center overflow-hidden py-20 lg:py-0"
    >
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 w-full text-center">
        <motion.p
          className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Bắt Đầu Ngay · Get Started
        </motion.p>

        <motion.h2
          className="text-5xl lg:text-7xl font-black text-white leading-tight mb-4"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Sẵn sàng in ấn?
        </motion.h2>
        <motion.p
          className="text-4xl lg:text-5xl font-light text-white/50 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Ready to print?
        </motion.p>

        <motion.p
          className="text-white/70 text-lg max-w-xl mx-auto mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Liên hệ ngay để nhận báo giá miễn phí trong vòng 30 phút.
          <br />
          <span className="text-white/40 text-base">
            Contact us for a free quote within 30 minutes.
          </span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.4 }}
        >
          <a
            href="tel:0901448377"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-red font-black text-lg rounded-full hover:scale-105 transition-transform shadow-2xl"
          >
            Nhận báo giá ngay <span aria-hidden>→</span>
          </a>
          <a
            href="mailto:contact@vietdragon.vn"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold text-base rounded-full hover:border-white hover:bg-white/10 transition-colors"
          >
            contact@vietdragon.vn
          </a>
        </motion.div>

        {/* Contact details */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <span>📞 0901 448 377 · 0919 510 543</span>
          <span className="hidden sm:block">·</span>
          <span>📧 contact@vietdragon.vn</span>
          <span className="hidden sm:block">·</span>
          <span>📍 TP. Hồ Chí Minh &amp; Bình Dương</span>
        </motion.div>
      </div>
    </section>
  );
}
