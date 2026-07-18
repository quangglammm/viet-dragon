"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { WipeButton } from "@/components/ui/wipe-button";

// Template's shop-banner-items use punchy solid/gradient color-block backgrounds
// (var(--theme) and a blue gradient), not neutral tones — matched via inline style
// since the blue gradient isn't part of this project's brand token set.
// Reuses the same "card" / "paper-box" product photos shown elsewhere
// (Shop.tsx, category pages) rather than needing dedicated banner images.
const banners = [
  { href: "/products/marketing", src: "/images/product/vd-item-card.jpeg", background: "var(--brand-primary)" },
  { href: "/products/packaging", src: "/images/product/vd-item-box.jpg", background: "linear-gradient(90deg, #4971f9 0%, #2fabf7 100%)" },
] as const;

type BannerCopy = { eyebrow: string; title: string };

export default function ShopBanner() {
  const t = useTranslations("shopBanner");
  const copy = t.raw("banners") as BannerCopy[];

  return (
    <section className="relative w-full bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {banners.map((b, i) => {
          const { eyebrow, title } = copy[i];
          return (
            <motion.div
              key={b.href}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="group relative rounded-2xl overflow-hidden"
              style={{ background: b.background }}
            >
              {/* Decorative shape peeking bottom-right, echoing the template's
                  product-right-img-shape without needing a bitmap asset. */}
              <div className="absolute -bottom-16 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              {/* Asymmetric split: narrower content column, wider image column that
                  bleeds to the card's edge (template: col-xl-5 content / col-xl-7 image). */}
              <div className="relative grid grid-cols-5 items-center h-full">
                <div className="col-span-2 p-6 lg:p-8">
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-white/70">
                    {eyebrow}
                  </p>
                  <h3 className="text-xl lg:text-2xl font-black leading-tight mb-6 text-white">
                    {title}
                  </h3>
                  <WipeButton href={b.href} tone="light" size="md">
                    {t("cta")}
                  </WipeButton>
                </div>
                <motion.div
                  className="relative col-span-3 h-full min-h-[220px] overflow-hidden transition-transform duration-500 group-hover:translate-x-[15px]"
                  variants={{
                    hidden: { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, y: "-4%" },
                    visible: {
                      clipPath: "inset(0% 0% 0% 0%)",
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: [0.645, 0.045, 0.355, 1] },
                    },
                  }}
                >
                  <Image
                    src={b.src}
                    alt={title}
                    fill
                    sizes="(min-width: 768px) 30vw, 60vw"
                    className="object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
