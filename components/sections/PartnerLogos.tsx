"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface PartnerItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  className: string;
}

const partners: PartnerItem[] = [
  {
    id: "danfoss",
    name: "Danfoss",
    src: "/images/partner/doitac1.webp",
    width: 1905,
    height: 826,
    className: "max-h-8 sm:max-h-11 lg:max-h-14 w-auto max-w-[95px] sm:max-w-[150px] lg:max-w-[180px]",
  },
  {
    id: "spicybox",
    name: "Spicybox",
    src: "/images/partner/doitac2.webp",
    width: 2020,
    height: 779,
    className: "max-h-8 sm:max-h-11 lg:max-h-14 w-auto max-w-[100px] sm:max-w-[160px] lg:max-w-[190px]",
  },
  {
    id: "lala-bear",
    name: "Lala Bear",
    src: "/images/partner/doitac3.webp",
    width: 1351,
    height: 1164,
    className: "max-h-10 sm:max-h-13 lg:max-h-16 w-auto max-w-[80px] sm:max-w-[125px] lg:max-w-[150px]",
  },
  {
    id: "montclair",
    name: "Montclair Gourmet Food",
    src: "/images/partner/doitac4.webp",
    width: 1254,
    height: 1254,
    className: "max-h-10 sm:max-h-13 lg:max-h-16 w-auto max-w-[80px] sm:max-w-[125px] lg:max-w-[150px]",
  },
  {
    id: "frico",
    name: "Frico Lifestyle Centre",
    src: "/images/partner/doitac5.webp",
    width: 1536,
    height: 1024,
    className: "max-h-8 sm:max-h-11 lg:max-h-14 w-auto max-w-[100px] sm:max-w-[160px] lg:max-w-[190px]",
  },
  {
    id: "annam-gourmet",
    name: "Annam Gourmet",
    src: "/images/partner/doitac6.webp",
    width: 1254,
    height: 1254,
    className: "max-h-10 sm:max-h-13 lg:max-h-16 w-auto max-w-[80px] sm:max-w-[125px] lg:max-w-[150px]",
  },
];

export default function PartnerLogos() {
  const t = useTranslations("partners");

  return (
    <section className="relative w-full bg-white py-10 lg:py-14 border-y border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="hidden sm:block h-px w-12 bg-zinc-200" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-dark uppercase">
            {t("title")}
          </h3>
          <span className="hidden sm:block h-px w-12 bg-zinc-200" />
        </motion.div>

        {/* 6 logos arranged in 2 rows (3 columns per row) */}
        <motion.div
          className="grid grid-cols-3 gap-x-4 sm:gap-x-8 lg:gap-x-14 gap-y-6 sm:gap-y-8 lg:gap-10 items-center justify-items-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center w-full h-14 sm:h-18 lg:h-22 px-2 sm:px-4"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                className={`${partner.className} object-contain transition-transform duration-300 hover:scale-105 select-none`}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
