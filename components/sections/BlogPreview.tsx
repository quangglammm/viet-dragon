"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Clock, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconBadge } from "@/components/ui/icon-badge";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { blogPosts, categoryColors } from "@/data/posts";

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const preview = blogPosts.slice(0, 3);

export default function BlogPreview() {
  const t = useTranslations("blogPreview");
  const locale = useLocale() as Locale;

  return (
    <section
      id="blog"
      className="relative w-full bg-white flex items-center overflow-hidden py-14 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("titleLine1")}{" "}
              <span className="text-brand-primary">{t("titleHighlight")}</span>
            </>
          }
          className="text-center mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((post, i) => {
            const title = pickLocale(locale, post.title, post.titleEn);
            const excerpt = pickLocale(locale, post.excerpt, post.excerptEn);
            const category = pickLocale(locale, post.categoryVi, post.categoryEn);
            return (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="relative h-52 rounded-2xl overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute bottom-3 right-4 px-3 py-1 rounded-full text-[11px] font-semibold ${categoryColors[post.category].bg} ${categoryColors[post.category].text}`}>
                      {category}
                    </span>
                  </div>

                  <div className="pt-5">
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
                      <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime} {t("minute")}</span>
                      <span>{formatDate(post.date, locale)}</span>
                    </div>
                    <h3 className="font-black text-zinc-900 text-lg leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mt-2 line-clamp-2">
                      {excerpt}
                    </p>
                    <p className="mt-3 text-brand-primary text-xs font-semibold flex items-center gap-2">
                      {t("readMore")}
                      <IconBadge
                        icon={ArrowRight}
                        size="sm"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {t("viewAll")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
