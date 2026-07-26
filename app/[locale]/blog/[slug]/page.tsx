import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { blogPosts, categoryColors } from "@/data/posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${pickLocale(locale, post.title, post.titleEn)} | Viet Dragon Blog`,
    description: pickLocale(locale, post.excerpt, post.excerptEn),
  };
}

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale; slug: string }>;
}>) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blogPostPage" });
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const title = pickLocale(locale, post.title, post.titleEn);
  const excerpt = pickLocale(locale, post.excerpt, post.excerptEn);
  const category = pickLocale(locale, post.categoryVi, post.categoryEn);
  const content = pickLocale(locale, post.content, post.contentEn);

  const idx = blogPosts.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? blogPosts[idx - 1] : null;
  const next = idx < blogPosts.length - 1 ? blogPosts[idx + 1] : null;

  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div className="relative h-[380px] lg:h-[480px] w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
          preload
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/40 to-zinc-950/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-12 w-full">
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/50 mb-6">
              <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">{t("breadcrumbBlog")}</Link>
              <span>/</span>
              <span className="text-white/80 line-clamp-1">{title}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category].bg} ${categoryColors[post.category].text}`}>
                {category}
              </span>
              <span className="text-white/50 text-xs flex items-center gap-1.5">
                <Clock size={12} /> {post.readTime} {t("minuteRead")}
              </span>
              <span className="text-white/50 text-xs flex items-center gap-1.5">
                <Calendar size={12} /> {formatDate(post.date, locale)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-lg text-zinc-600 leading-relaxed mb-10 font-medium border-l-4 border-brand-primary pl-5">
          {excerpt}
        </p>

        <div className="prose prose-zinc prose-base max-w-none">
          {paragraphs.map((para) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <h3 key={para} className="text-xl font-black text-zinc-900 mt-8 mb-3">
                  {para.slice(2, -2)}
                </h3>
              );
            }
            const parts = para.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={para} className="text-zinc-600 leading-relaxed mb-4">
                {parts.map((part) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={part} className="text-zinc-900 font-bold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          })}
        </div>

        {/* CTA inline */}
        <div className="mt-14 p-8 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-black text-zinc-900 text-lg">{t("needHelp")}</p>
            <p className="text-zinc-500 text-sm mt-1">
              {t("needHelpDesc")}
            </p>
          </div>
          <Link
            href="/#cta"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe text-sm whitespace-nowrap"
          >
            {t("contactNow")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Post navigation ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group max-w-xs"
            >
              <ArrowLeft size={16} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className="line-clamp-1">{pickLocale(locale, prev.title, prev.titleEn)}</span>
            </Link>
          ) : (
            <Link
              href="/blog"
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t("allPosts")}</span>
            </Link>
          )}

          <Link href="/blog" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            {t("viewAll")}
          </Link>

          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group max-w-xs text-right"
            >
              <span className="line-clamp-1">{pickLocale(locale, next.title, next.titleEn)}</span>
              <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              href="/#cta"
              className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80 transition-opacity group"
            >
              <span>{t("getQuote")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
