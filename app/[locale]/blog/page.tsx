import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBlog } from "@/lib/content/read/load";
import { blogIndexOf } from "@/lib/content/read/posts";
import { breadcrumbLd, metadataFor } from "@/lib/content/read/page-seo";
import { samePath } from "@/lib/content/read/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PostCategoryBadge } from "@/components/blog/post-category-badge";
import { localeOf } from "@/lib/route-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale: localeSegment } = await params;
  const locale = localeOf(localeSegment);
  const t = await getTranslations({ locale, namespace: "blogPage" });
  return metadataFor({ locale, meta: { title: t("metaTitle"), description: t("metaDescription"), image: null }, paths: samePath("/blog") });
}

export default async function BlogPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale: localeSegment } = await params;
  const locale = localeOf(localeSegment);
  const t = await getTranslations({ locale, namespace: "blogPage" });
  const { featured, rest } = blogIndexOf(await getBlog(), locale);

  return (
    <div className="bg-white">
      <JsonLd data={breadcrumbLd(locale, [{ name: t("breadcrumbHome"), path: "/" }, { name: t("breadcrumbCurrent"), path: "/blog" }])} />
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 mb-10">
          <Link href="/" className="hover:text-zinc-700 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">{t("breadcrumbCurrent")}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-brand-primary text-sm font-semibold tracking-widest uppercase mb-3">
              {t("eyebrow")}
            </p>
            <h1 className="text-5xl lg:text-6xl font-black text-zinc-900 leading-tight">
              {t("titleLine1")}{" "}
              <span className="text-brand-primary">{t("titleHighlight")}</span>
            </h1>
          </div>
          <p className="text-zinc-500 max-w-sm leading-relaxed lg:text-right text-sm">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── Featured post ── */}
      {featured && (
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <Link href={featured.href} className="group block">
          <div className="relative rounded-2xl overflow-hidden h-[420px] lg:h-[500px]">
            {featured.cover && (
              <Image
                src={featured.cover}
                alt={featured.title}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                preload
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/45 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-3 mb-4 text-shadow-dark">
                <PostCategoryBadge category={featured.category} className="px-3 py-1 text-xs" />
                {featured.readTimeMin !== null && (
                  <span className="text-white/80 text-xs flex items-center gap-1">
                    <Clock size={11} /> {featured.readTimeMin} {t("minute")}
                  </span>
                )}
                <span className="text-white/70 text-xs">{featured.date}</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-2 group-hover:text-brand-primary transition-colors text-shadow-dark-lg">
                {featured.title}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-2xl line-clamp-2 text-shadow-dark">
                {featured.excerpt}
              </p>
              <p className="mt-4 text-brand-primary text-sm font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {t("readArticle")} <ArrowRight size={14} />
              </p>
            </div>
          </div>
        </Link>
      </div>
      )}

      {/* ── Post grid ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            {t("allPosts")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.uid} href={post.href} className="group block">
                <div className="h-full flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
                  {/* Cover */}
                  <div className="relative h-48 overflow-hidden bg-zinc-100 shrink-0">
                    {post.cover && (
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <PostCategoryBadge category={post.category} className="px-2.5 py-1 text-[11px]" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-3 p-5 flex-1 bg-white">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      {post.readTimeMin !== null && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTimeMin} {t("minute")}</span>}
                      <span>{post.date}</span>
                    </div>
                    <h3 className="font-black text-zinc-900 text-base leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <p className="text-brand-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("readMore")}
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
          src="/images/cta/vd-cta-banner.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/85" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-black text-white">
              {t("ctaTitleLine1")}{" "}
              <span className="text-brand-primary">{t("ctaTitleHighlight")}</span>
            </h3>
            <p className="text-white/50 mt-1 text-sm">
              {t("ctaSubtitle")}
            </p>
          </div>
          <Link
            href="/#cta"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm"
          >
            {t("ctaButton")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
