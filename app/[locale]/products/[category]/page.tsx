import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { NamedIcon } from "@/components/ui/named-icon";
import { categoryPageOf } from "@/lib/content/read/pages";
import { breadcrumbLd, metadataFor } from "@/lib/content/read/page-seo";
import { alternatePaths, categoryPath } from "@/lib/content/read/urls";
import { JsonLd } from "@/components/seo/json-ld";
import { peekPage, resolvePage } from "@/lib/content/read/resolve-page";

type CategoryParams = { locale: Locale; category: string };

export async function generateMetadata({ params }: { params: Promise<CategoryParams> }): Promise<Metadata> {
  const { locale, category } = await params;
  const found = await peekPage(locale, { category });
  if (!found) return {};
  return metadataFor({ locale, meta: categoryPageOf(found.catalog, locale, found.category).meta, paths: alternatePaths(found.catalog, found.category, null, null) });
}

export default async function CategoryPage({ params }: Readonly<{ params: Promise<CategoryParams> }>) {
  const { locale, category } = await params;
  const t = await getTranslations({ locale, namespace: "categoryPage" });
  const found = await resolvePage(locale, { category });
  const { name, description, icon, cover, cards: items, prev, next } = categoryPageOf(found.catalog, locale, found.category);

  const crumbs = [
    { name: t("breadcrumbHome"), path: "/" },
    { name: t("breadcrumbProducts"), path: "/products" },
    { name, path: categoryPath(locale, found.category) },
  ];

  return (
    <div className="bg-white">
      <JsonLd data={breadcrumbLd(locale, crumbs)} />
      {/* ── Full-width hero image ── */}
      <div className="relative h-[420px] lg:h-[520px] w-full overflow-hidden">
        {cover && (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="100vw"
            className="object-cover"
            preload
          />
        )}
        {/* Dark overlay + content */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/65 to-zinc-950/25" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            {/* Breadcrumb over image */}
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/90 mb-6 font-medium text-shadow-dark">
              <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
              <span className="text-white/70">/</span>
              <Link href="/products" className="hover:text-white transition-colors">{t("breadcrumbProducts")}</Link>
              <span className="text-white/70">/</span>
              <span className="text-white font-bold">{name}</span>
            </nav>

            <div className="flex items-end gap-5">
              <span className="p-4 rounded-2xl bg-black/35 backdrop-blur-md border border-white/25 text-white shrink-0 shadow-xl">
                <NamedIcon name={icon} size={28} strokeWidth={1.5} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </span>
              <div>
                <p className="text-white text-sm font-semibold tracking-widest uppercase mb-1 text-shadow-dark">
                  {t("eyebrow")}
                </p>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight text-shadow-dark-lg">
                  {name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category description ── */}
      <div className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-zinc-500 leading-relaxed max-w-2xl">
            {description}
          </p>
          <Link
            href="/#cta"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-bold uppercase tracking-wide btn-wipe whitespace-nowrap"
          >
            {t("getQuote")} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Product items ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
          {t("itemCount", { count: items.length })}
        </p>

        <div className={items.length === 8 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {items.map((item) => {
            const itemHref = item.href;
            const itemName = item.title;
            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-md transition-all duration-300"
              >
                {/* Item image */}
                <Link href={itemHref} className="relative h-52 overflow-hidden bg-zinc-100 block">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={itemName}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </Link>

                {/* Item info */}
                <div className="flex flex-col gap-2 p-5 flex-1 bg-white">
                  <div>
                    <Link href={itemHref} className="font-black text-zinc-900 text-base hover:text-brand-primary transition-colors">
                      {itemName}
                    </Link>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <Link
                    href={itemHref}
                    className="text-xs font-semibold text-brand-primary hover:opacity-70 transition-opacity self-start mt-2 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    {t("getQuote")} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Sample gallery strip ── */}
        <div className="mt-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-5">
            {t("referenceGallery")}
          </p>
          <div className={items.length === 8 ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"}>
            {items.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden group h-32 sm:h-36 lg:h-40">
                {item.referenceImage && (
                  <Image
                    src={item.referenceImage}
                    alt={item.title}
                    fill
                    sizes={items.length === 8 ? "(min-width: 1024px) 12.5vw, (min-width: 640px) 25vw, 50vw" : "(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Quote CTA ── */}
        <div className="mt-16 relative rounded-2xl overflow-hidden">
          <Image
            src="/images/cta/vd-cta-banner.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
          <div className="relative px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-black text-white text-2xl">
                {t("ctaTitleLine1")}{" "}
                <span className="text-brand-primary">{name}</span>?
              </h3>
              <p className="text-white/50 text-sm mt-1">
                {t("ctaSubtitle")}
              </p>
            </div>
            <Link
              href="/#cta"
              data-quote-product={name}
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm"
            >
              {t("ctaButton")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category pagination ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={prev.href}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{prev.label}</span>
              <span className="sm:hidden">{t("prevShort")}</span>
            </Link>
          ) : (
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t("allProducts")}</span>
            </Link>
          )}

          <Link href="/products" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            {t("viewAll")}
          </Link>

          {next ? (
            <Link
              href={next.href}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <span className="hidden sm:inline">{next.label}</span>
              <span className="sm:hidden">{t("nextShort")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
