"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Briefcase, Package, Tag, Calendar, type LucideIcon } from "lucide-react";
import { productCategories } from "@/data/categories";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Tag, Calendar };

export default function Products() {
  return (
    <section
      id="products"
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-white flex items-center overflow-hidden py-20 lg:py-0"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.p
              className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              Sản Phẩm · Products
            </motion.p>
            <motion.h2
              className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              Danh mục sản phẩm{" "}
              <span className="text-brand-red">đa dạng.</span>
            </motion.h2>
          </div>
          <motion.a
            href="/products"
            className="hidden lg:inline-flex text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Xem tất cả →
          </motion.a>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon] ?? Briefcase;
            return (
              <Link key={cat.id} href={`/products/${cat.id}`} className="block">
                <motion.div
                  className="group h-full flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.05 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Cover image with icon + title overlaid */}
                  <div className="relative h-36 overflow-hidden shrink-0">
                    <Image
                      src={cat.coverImage}
                      alt={cat.nameVi}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/75 to-zinc-900/10" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white shrink-0">
                        <Icon size={14} strokeWidth={1.5} />
                      </span>
                      <div>
                        <p className="text-white font-black text-xs leading-snug">{cat.nameVi}</p>
                        <p className="text-white/60 text-[10px]">{cat.nameEn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col gap-3 p-4 bg-white flex-1">
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex px-2 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-medium rounded-full"
                        >
                          {item.nameVi}
                        </span>
                      ))}
                    </div>

                    <p className="text-brand-red text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                      Xem chi tiết →
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
