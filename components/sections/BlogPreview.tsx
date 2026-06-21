"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts, categoryColors } from "@/data/posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const preview = blogPosts.slice(0, 3);

export default function BlogPreview() {
  const [featured, ...side] = preview;

  return (
    <section
      id="blog"
      className="scroll-panel relative min-h-screen lg:h-screen w-full bg-brand-cream flex items-center overflow-hidden py-20 lg:py-0"
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
              Bài Viết · Kiến Thức In Ấn
            </motion.p>
            <motion.h2
              className="text-4xl lg:text-5xl font-black text-zinc-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              Mẹo, dự án &{" "}
              <span className="text-brand-red">tin tức.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/blog"
              className="hidden lg:inline-flex text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Xem tất cả →
            </Link>
          </motion.div>
        </div>

        {/* Grid: 1 large + 2 stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Featured post */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={`/blog/${featured.slug}`} className="group block h-full">
              <div className="relative rounded-2xl overflow-hidden h-full min-h-[340px]">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[featured.category].bg} ${categoryColors[featured.category].text}`}>
                      {featured.categoryVi}
                    </span>
                    <span className="text-white/50 text-xs flex items-center gap-1">
                      <Clock size={10} /> {featured.readTime} phút
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-snug mb-2 group-hover:text-brand-red transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">{featured.excerpt}</p>
                  <p className="mt-3 text-brand-red text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Đọc bài viết <ArrowRight size={12} />
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side posts */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {side.map((post, i) => (
              <motion.div
                key={post.slug}
                className="flex-1"
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/blog/${post.slug}`} className="group flex h-full rounded-2xl border border-zinc-200 overflow-hidden bg-white hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative w-28 shrink-0 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col justify-center gap-1.5 p-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[post.category].bg} ${categoryColors[post.category].text}`}>
                        {post.categoryVi}
                      </span>
                      <span className="text-zinc-400 text-[10px] flex items-center gap-1">
                        <Clock size={10} /> {post.readTime} phút
                      </span>
                    </div>
                    <p className="font-black text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                      {post.title}
                    </p>
                    <p className="text-zinc-400 text-[11px]">{formatDate(post.date)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
