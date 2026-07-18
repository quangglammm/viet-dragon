import type { Metadata } from "next";
import Image from "next/image";
import {
  Briefcase, Package, Calendar, Gift,
  ArrowRight, type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories, showcaseImages } from "@/data/categories";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });
  const [s1, s2, s3, s4, s5] = showcaseImages;
  const showcaseLabel = (s: (typeof showcaseImages)[number]) =>
    pickLocale(locale, s.label, s.labelEn);

  return (
    <div className="bg-white">
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
      <div className="max-w-7xl mx-auto px-6 pb-16">

        {/* Mobile grid (< lg): simple 2-column with fixed card heights */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {showcaseImages.map((s, i) => (
            <div
              key={s.seed}
              className={`relative rounded-2xl overflow-hidden group ${i === 0 ? "col-span-2 h-52" : "h-40"}`}
            >
              <Image
                src={s.src}
                alt={showcaseLabel(s)}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop editorial layout (lg+) */}
        <div className="hidden lg:block">
          {/* Row 1: tall left + 2 squares right */}
          <div className="grid grid-cols-3 gap-3 h-[480px]">
            {/* Large portrait */}
            <div className="col-span-1 relative rounded-2xl overflow-hidden group">
              <Image
                src={s1.src}
                alt={showcaseLabel(s1)}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-white font-black text-base">{showcaseLabel(s1)}</p>
              </div>
            </div>

            {/* Right: 2 squares stacked */}
            <div className="col-span-2 grid grid-rows-2 gap-3">
              {[s2, s3].map((s) => (
                <div key={s.seed} className="relative rounded-2xl overflow-hidden group">
                  <Image
                    src={s.src}
                    alt={showcaseLabel(s)}
                    fill
                    sizes="66vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: 2 wide side-by-side */}
          <div className="grid grid-cols-2 gap-3 mt-3 h-[260px]">
            {[s4, s5].map((s) => (
              <div key={s.seed} className="relative rounded-2xl overflow-hidden group">
                <Image
                  src={s.src}
                  alt={showcaseLabel(s)}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-white font-black text-sm">{showcaseLabel(s)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery caption */}
        <p className="text-center text-xs text-zinc-400 mt-4">
          {t("galleryCaption")}
        </p>
      </div>

      {/* ── Category grid ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            {t("browseByCategory")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {productCategories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Briefcase;
              const name = pickLocale(locale, cat.nameVi, cat.nameEn);
              const description = pickLocale(locale, cat.descriptionVi, cat.description);
              return (
                <Link key={cat.id} href={`/products/${cat.id}`} className="group block">
                  <div className="h-full rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-300 hover:shadow-lg transition-all duration-300">
                    {/* Cover image */}
                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={cat.coverImage}
                        alt={name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                          <Icon size={18} strokeWidth={1.5} />
                        </span>
                        <div>
                          <p className="text-white font-black text-base leading-snug">{name}</p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="absolute top-4 right-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                      />
                    </div>

                    {/* Card body */}
                    <div className="p-6 bg-white flex flex-col gap-4">
                      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map((item) => (
                          <span
                            key={item.id}
                            className="px-3 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-medium rounded-full"
                          >
                            {pickLocale(locale, item.nameVi, item.nameEn)}
                          </span>
                        ))}
                      </div>
                      <p className="text-brand-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {t("viewDetail")}
                      </p>
                    </div>
                  </div>
                </Link>
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
