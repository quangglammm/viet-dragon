import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { NamedIcon } from "@/components/ui/named-icon";
import { getShowcase } from "@/lib/content/read/load";
import { showcaseCardsOf } from "@/lib/content/read/merchandising";
import { breadcrumbLd, metadataFor } from "@/lib/content/read/page-seo";
import { samePath } from "@/lib/content/read/seo";
import { getNavigation } from "@/lib/content/read/site";
import { JsonLd } from "@/components/seo/json-ld";
import { ShowcaseGallery } from "@/components/sections/ShowcaseGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  return metadataFor({ locale, meta: { title: t("metaTitle"), description: t("metaDescription"), image: null }, paths: samePath("/products") });
}

export default async function ProductsPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  const { categories } = await getNavigation(locale);
  const showcase = showcaseCardsOf(await getShowcase(), locale);

  return (
    <div className="bg-white">
      <JsonLd data={breadcrumbLd(locale, [{ name: t("breadcrumbHome"), path: "/" }, { name: t("breadcrumbCurrent"), path: "/products" }])} />
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

      {/* ── Editorial showcase gallery ── */}
      <ShowcaseGallery cards={showcase} caption={t("galleryCaption")} />

      {/* ── Category grid ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            {t("browseByCategory")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat) => {
              const { name, description } = cat;
              const subgroups = cat.cards;
              return (
                <div key={cat.id} className="group block">
                  <div className="h-full rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300 bg-white flex flex-col">
                    {/* Cover image */}
                    <Link href={cat.href} className="block relative h-52 overflow-hidden shrink-0">
                      {cat.cover && (
                        <Image
                          src={cat.cover}
                          alt={name}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                          <NamedIcon name={cat.icon} size={18} strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-white font-black text-base leading-snug">{name}</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="absolute top-4 right-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                      />
                    </Link>

                    {/* Card body */}
                    <div className="p-6 flex flex-col justify-between gap-6 flex-1">
                      <div className="flex flex-col gap-4">
                        <Link
                          href={cat.href}
                          className="block text-zinc-500 text-sm leading-relaxed hover:text-zinc-800 transition-colors"
                        >
                          {description}
                        </Link>
                        {/* Subcategory buttons: visible on mobile, smooth slide-up reveal on desktop hover */}
                        <div className="flex flex-wrap gap-2 pt-1 opacity-100 lg:opacity-0 lg:-translate-y-2 lg:pointer-events-none lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:pointer-events-auto transition-all duration-300">
                          {subgroups.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              className="px-3.5 py-1.5 bg-zinc-50 hover:bg-brand-soft hover:text-brand-primary border border-zinc-200 hover:border-brand-primary/30 text-zinc-700 text-xs font-semibold rounded-full transition-all duration-200"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <Link
                          href={cat.href}
                          className="text-brand-primary text-sm font-semibold hover:underline"
                        >
                          {t("viewDetail")}
                        </Link>
                        <span className="text-xs text-zinc-400 font-medium">
                          {t("productCount", { count: subgroups.length })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
