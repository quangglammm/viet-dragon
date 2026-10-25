import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LOCALES } from "@/lib/content/schemas";
import { postPageOf, postPath } from "@/lib/content/read/posts";
import { blogPostingLd, breadcrumbLd, metadataFor } from "@/lib/content/read/page-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { peekPost, resolvePost } from "@/lib/content/read/resolve-post";
import { PostBody } from "@/components/blog/post-body";
import { PostCategoryBadge } from "@/components/blog/post-category-badge";
import { localeOf } from "@/lib/route-locale";

type PostParams = { locale: Locale; slug: string };

export async function generateMetadata({ params }: { params: Promise<PostParams> }): Promise<Metadata> {
  const { locale: localeSegment, slug } = await params;
  const locale = localeOf(localeSegment);
  const found = await peekPost(locale, slug);
  if (!found) return {};
  const paths = Object.fromEntries(LOCALES.map((language) => [language, postPath(language, found.post)])) as Record<(typeof LOCALES)[number], string>;
  return metadataFor({ locale, meta: postPageOf(found.blog, locale, found.post).meta, paths, type: "article", publishedTime: found.post.publishedOn });
}

export default async function BlogPostPage({ params }: Readonly<{ params: Promise<PostParams> }>) {
  const { locale: localeSegment, slug } = await params;
  const locale = localeOf(localeSegment);
  const t = await getTranslations({ locale, namespace: "blogPostPage" });
  const found = await resolvePost(locale, slug);
  const { post, dateLong, blocks, prev, next, meta } = postPageOf(found.blog, locale, found.post);
  const crumbs = [
    { name: t("breadcrumbHome"), path: "/" },
    { name: t("breadcrumbBlog"), path: "/blog" },
    { name: post.title, path: post.href },
  ];

  return (
    <div className="bg-white">
      <JsonLd data={[breadcrumbLd(locale, crumbs), await blogPostingLd(locale, { headline: post.title, description: meta.description, path: post.href, image: meta.image, datePublished: post.publishedOn })]} />
      {/* ── Hero ── */}
      <div className="relative h-[380px] lg:h-[480px] w-full overflow-hidden">
        {post.cover && (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            preload
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/65 to-zinc-950/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-6 pb-12 w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/90 mb-6 font-medium text-shadow-dark">
              <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
              <span className="text-white/70">/</span>
              <Link href="/blog" className="hover:text-white transition-colors">{t("breadcrumbBlog")}</Link>
              <span className="text-white/70">/</span>
              <span className="text-white font-bold line-clamp-1">{post.title}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-shadow-dark">
              <PostCategoryBadge category={post.category} className="px-3 py-1 text-xs" />
              {post.readTimeMin !== null && (
                <span className="text-white/80 text-xs flex items-center gap-1.5">
                  <Clock size={12} /> {post.readTimeMin} {t("minuteRead")}
                </span>
              )}
              <span className="text-white/80 text-xs flex items-center gap-1.5">
                <Calendar size={12} /> {dateLong}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight text-shadow-dark-lg">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-lg text-zinc-600 leading-relaxed mb-10 font-medium border-l-4 border-brand-primary pl-5">
          {post.excerpt}
        </p>

        <PostBody blocks={blocks} />

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
              href={prev.href}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group max-w-xs"
            >
              <ArrowLeft size={16} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className="line-clamp-1">{prev.label}</span>
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
              href={next.href}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group max-w-xs text-right"
            >
              <span className="line-clamp-1">{next.label}</span>
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
