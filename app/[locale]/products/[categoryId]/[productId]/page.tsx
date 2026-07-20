import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Briefcase, Package, Calendar, Gift,
  ArrowLeft, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { MaterialFlashcard } from "@/components/ui/material-flashcard";
import { MaterialGlossaryFab } from "@/components/ui/material-glossary-fab";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift };

export function generateStaticParams() {
  return productCategories.flatMap((cat) =>
    cat.items.map((item) => ({ categoryId: cat.id, productId: item.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId, productId } = await params;
  const cat = productCategories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === productId);
  if (!cat || !item) return {};
  return {
    title: `${pickLocale(locale, item.nameVi, item.nameEn)} | Viet Dragon`,
    description: pickLocale(locale, item.descriptionVi, item.description),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}) {
  const { locale, categoryId, productId } = await params;
  const t = await getTranslations({ locale, namespace: "productDetailPage" });
  const cat = productCategories.find((c) => c.id === categoryId);
  const item = cat?.items.find((i) => i.id === productId);
  if (!cat || !item) notFound();

  const name = pickLocale(locale, item.nameVi, item.nameEn);
  const catName = pickLocale(locale, cat.nameVi, cat.nameEn);
  const Icon = iconMap[cat.icon] ?? Briefcase;

  const idx = cat.items.findIndex((i) => i.id === productId);
  const prev = idx > 0 ? cat.items[idx - 1] : null;
  const next = idx < cat.items.length - 1 ? cat.items[idx + 1] : null;

  return (
    <div className="bg-white">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-zinc-700 transition-colors">{t("breadcrumbHome")}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-700 transition-colors">{t("breadcrumbProducts")}</Link>
          <span>/</span>
          <Link href={`/products/${cat.id}`} className="hover:text-zinc-700 transition-colors">{catName}</Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">{name}</span>
        </nav>
      </div>

      {/* ── Product panel ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <Image
              src={item.image}
              alt={name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              preload
            />
          </div>

          <div className="flex flex-col gap-6">
            <Link
              href={`/products/${cat.id}`}
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <Icon size={13} strokeWidth={1.5} /> {catName}
            </Link>

            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">{name}</h1>

            <p className="text-zinc-500 leading-relaxed">
              {pickLocale(locale, item.descriptionVi, item.description)}
            </p>

            {item.optionGroups && item.optionGroups.length > 0 && (
              <div className="flex flex-col gap-8 mt-2">
                {item.optionGroups.map((group, gi) => (
                  <div key={gi} className="flex flex-col gap-6">
                    {group.options.map((opt, i) => (
                      <div key={i}>
                        <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">
                          {pickLocale(locale, opt.taglineVi, opt.tagline)}
                        </p>
                        <MaterialFlashcard
                          option={opt}
                          locale={locale}
                          productName={name}
                          fallbackImage={item.image}
                          descriptionLabel={t("optionDescriptionLabel")}
                          bestForLabel={t("optionBestForLabel")}
                          viewImageHint={t("optionViewImageHint")}
                          backToDetailsHint={t("optionBackToDetailsHint")}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {item.optionGroups && item.optionGroups.length > 0 && <MaterialGlossaryFab />}

      {/* ── Quote CTA ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative rounded-2xl overflow-hidden">
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
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-brand-primary text-white font-bold uppercase tracking-wide btn-wipe whitespace-nowrap text-sm"
            >
              {t("ctaButton")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Product pagination ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/products/${cat.id}/${prev.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{pickLocale(locale, prev.nameVi, prev.nameEn)}</span>
              <span className="sm:hidden">{t("prevShort")}</span>
            </Link>
          ) : (
            <Link
              href={`/products/${cat.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t("backToCategory")}</span>
            </Link>
          )}

          <Link href={`/products/${cat.id}`} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
            {t("viewAllInCategory")}
          </Link>

          {next ? (
            <Link
              href={`/products/${cat.id}/${next.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <span className="hidden sm:inline">{pickLocale(locale, next.nameVi, next.nameEn)}</span>
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
