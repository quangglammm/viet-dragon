"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const services = [
  {
    icon: "💬",
    vi: "Tư Vấn",
    en: "Consultation",
    desc: "Đội ngũ chuyên viên tư vấn tận tâm, hỗ trợ từ ý tưởng đến lựa chọn vật liệu phù hợp nhất.",
    tag: "Miễn Phí · Free",
  },
  {
    icon: "✏️",
    vi: "Thiết Kế",
    en: "Design",
    desc: "Thiết kế chuyên nghiệp theo yêu cầu, phối hợp chỉnh sửa không giới hạn đến khi ưng ý.",
    tag: "Miễn Phí · Free",
  },
  {
    icon: "🖨️",
    vi: "In Thử",
    en: "Sample Print",
    desc: "In thử miễn phí trước khi đặt hàng số lượng lớn — bạn thấy sản phẩm thực tế trước khi quyết định.",
    tag: "Miễn Phí · Free",
  },
  {
    icon: "🚚",
    vi: "Giao Hàng",
    en: "Delivery",
    desc: "Giao tận nơi nhanh chóng tại TP. Hồ Chí Minh và Bình Dương, không phụ phí giao hàng.",
    tag: "Miễn Phí · Free",
  },
];

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="services"
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-brand-cream flex items-center overflow-hidden py-20 lg:py-0"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-12">
          <motion.p
            className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Dịch Vụ Đi Kèm · Included Services
          </motion.p>
          <motion.h2
            className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Bốn dịch vụ đi kèm,{" "}
            <span className="text-brand-red">hoàn toàn miễn phí.</span>
          </motion.h2>
          <motion.p
            className="text-zinc-400 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Four bundled services — completely free with every order.
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-4 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.55,
                delay: 0.1 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="font-black text-zinc-900 text-lg">{s.vi}</p>
                <p className="text-zinc-400 text-sm">{s.en}</p>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed flex-1">{s.desc}</p>
              <span className="inline-flex self-start px-3 py-1 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded-full">
                {s.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
