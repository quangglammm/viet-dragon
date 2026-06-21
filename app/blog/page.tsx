import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { blogPosts, categoryColors } from "@/data/posts";

export const metadata: Metadata = {
  title: "Bài viết | Viet Dragon – In Ấn Chuyên Nghiệp",
  description:
    "Mẹo in ấn, case study dự án và tin tức mới nhất từ Viet Dragon.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="bg-white">
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 mb-10">
          <Link href="/" className="hover:text-zinc-700 transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">Bài Viết</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-brand-red text-sm font-semibold tracking-widest uppercase mb-3">
              Bài Viết · Kiến Thức In Ấn
            </p>
            <h1 className="text-5xl lg:text-6xl font-black text-zinc-900 leading-tight">
              Mẹo, dự án &{" "}
              <span className="text-brand-red">tin tức.</span>
            </h1>
          </div>
          <p className="text-zinc-500 max-w-sm leading-relaxed lg:text-right text-sm">
            Cập nhật kiến thức in ấn, xem case study thực tế và theo dõi những gì mới nhất từ Viet Dragon.
          </p>
        </div>
      </div>

      {/* ── Featured post ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <Link href={`/blog/${featured.slug}`} className="group block">
          <div className="relative rounded-2xl overflow-hidden h-[420px] lg:h-[500px]">
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[featured.category].bg} ${categoryColors[featured.category].text}`}>
                  {featured.categoryVi}
                </span>
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Clock size={11} /> {featured.readTime} phút đọc
                </span>
                <span className="text-white/40 text-xs">{formatDate(featured.date)}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-2 group-hover:text-brand-red transition-colors">
                {featured.title}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl line-clamp-2">
                {featured.excerpt}
              </p>
              <p className="mt-4 text-brand-red text-sm font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Đọc bài viết <ArrowRight size={14} />
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Post grid ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            Tất cả bài viết · All Posts
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="h-full flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
                  {/* Cover */}
                  <div className="relative h-48 overflow-hidden bg-zinc-100 shrink-0">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${categoryColors[post.category].bg} ${categoryColors[post.category].text}`}>
                        {post.categoryVi}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-3 p-5 flex-1 bg-white">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} phút</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <h3 className="font-black text-zinc-900 text-base leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <p className="text-brand-red text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Đọc tiếp →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="relative overflow-hidden">
        <Image
          src="https://picsum.photos/seed/vd-blog-cta/1400/400"
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-brand-dark/85" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black text-white">
              Sẵn sàng bắt đầu{" "}
              <span className="text-brand-red">dự án in ấn?</span>
            </h3>
            <p className="text-white/50 mt-1 text-sm">
              Miễn phí tư vấn &amp; thiết kế — báo giá trong 30 phút.
            </p>
          </div>
          <Link
            href="/#cta"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white font-semibold rounded-full hover:opacity-90 transition-opacity whitespace-nowrap text-sm"
          >
            Nhận báo giá ngay <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
