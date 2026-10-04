import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles,
  ArrowLeft, ArrowRight, ImagePlus,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocale } from "@/lib/locale";
import { MAIN_CATEGORIES, SUBGROUPS_CATALOG, getSubgroupById } from "@/data/subgroups-catalog";
import { MaterialFlashcard } from "@/components/ui/material-flashcard";
import { MaterialGlossaryFab } from "@/components/ui/material-glossary-fab";
import { CATEGORY_NAMES } from "@/data/translations";
import { checkPublicImageExists, sanitizeOptionImages } from "@/lib/image-check";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

export function generateStaticParams() {
  return SUBGROUPS_CATALOG.flatMap((sub) =>
    sub.shapes.map((shape) => ({
      categoryId: sub.categoryId,
      productId: sub.id,
      shapeId: shape.id,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string; shapeId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId, productId, shapeId } = await params;
  const subgroup = getSubgroupById(productId, categoryId);
  if (!subgroup) return {};

  const shape = subgroup.shapes.find((s) => s.id === shapeId);
  if (!shape) return {};

  const shapeName = pickLocale(locale, shape.nameVi, shape.nameEn, shape.nameZh, shape.nameJa, shape.nameKo);
  const subgroupTitle = pickLocale(locale, subgroup.titleVi, subgroup.titleEn, subgroup.titleZh, subgroup.titleJa, subgroup.titleKo);

  return {
    title: `${shapeName} - ${subgroupTitle} | Viet Dragon`,
    description: pickLocale(locale, shape.descriptionVi, shape.descriptionEn),
  };
}

export default async function ShapeMaterialDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale; categoryId: string; productId: string; shapeId: string }>;
}>) {
  const { locale, categoryId, productId, shapeId } = await params;
  const t = await getTranslations({ locale, namespace: "productDetailPage" });

  const subgroup = getSubgroupById(productId, categoryId);
  if (!subgroup) notFound();

  const shape = subgroup.shapes.find((s) => s.id === shapeId);
  if (!shape) notFound();

  const cat = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  const catName = cat
    ? pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko)
    : subgroup.categoryId.toUpperCase();
  const Icon = cat ? (iconMap[cat.icon] ?? Briefcase) : Layers;

  const subgroupTitle = pickLocale(locale, subgroup.titleVi, subgroup.titleEn, subgroup.titleZh, subgroup.titleJa, subgroup.titleKo);
  const shapeName = pickLocale(locale, shape.nameVi, shape.nameEn, shape.nameZh, shape.nameJa, shape.nameKo);
  const shapeDesc = pickLocale(locale, shape.descriptionVi, shape.descriptionEn);

  // Pagination across shapes within this subgroup
  const shapeIdx = subgroup.shapes.findIndex((s) => s.id === shapeId);
  const prevShape = shapeIdx > 0 ? subgroup.shapes[shapeIdx - 1] : null;
  const nextShape = shapeIdx < subgroup.shapes.length - 1 ? subgroup.shapes[shapeIdx + 1] : null;

  return (
    <div className="bg-white">
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-zinc-700 transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-zinc-700 transition-colors">
            {t("breadcrumbProducts")}
          </Link>
          <span>/</span>
          <Link href={`/products/${subgroup.categoryId}`} className="hover:text-zinc-700 transition-colors">
            {catName}
          </Link>
          <span>/</span>
          <Link href={`/products/${subgroup.categoryId}/${subgroup.id}`} className="hover:text-zinc-700 transition-colors">
            {subgroupTitle}
          </Link>
          <span>/</span>
          <span className="text-zinc-700 font-medium">{shapeName}</span>
        </nav>
      </div>

      {/* ── Product panel (Exact 2-column layout as /products/marketing/card) ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left sticky square image */}
          <div className="aspect-square rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <div className="relative w-full h-full">
              {checkPublicImageExists(shape.image) ? (
                <Image
                  src={shape.image}
                  alt={shapeName}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  preload
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200/50 p-6 select-none">
                  <div className="p-4 rounded-2xl bg-white/80 shadow-2xs border border-zinc-200/60 mb-2">
                    <ImagePlus size={36} strokeWidth={1.5} className="text-zinc-400" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 tracking-wide text-center">
                    {shapeName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Info, Shape Switcher, & Material Flashcards */}
          <div className="flex flex-col gap-6">
            <Link
              href={`/products/${subgroup.categoryId}/${subgroup.id}`}
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <Icon size={13} strokeWidth={1.5} /> {subgroupTitle}
            </Link>

            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">
              {shapeName}
            </h1>

            <p className="text-zinc-500 leading-relaxed">
              {shapeDesc}
            </p>


            {/* Material Flashcards stack */}
            {(() => {
              const displayMaterials = (shape.materials && shape.materials.length > 0)
                ? shape.materials
                : subgroup.materials;

              if (!displayMaterials || displayMaterials.length === 0) return null;

              return (
                <div className="flex flex-col gap-8 mt-2">
                  <div className="flex flex-col gap-6">
                    {displayMaterials.map((opt) => (
                      <div key={opt.name}>
                        <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">
                          {pickLocale(locale, opt.taglineVi, opt.tagline, opt.taglineZh, opt.taglineJa, opt.taglineKo)}
                        </p>
                        <MaterialFlashcard
                          option={sanitizeOptionImages(opt)}
                          locale={locale}
                          productName={`${shapeName} - ${pickLocale(locale, opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo)}`}
                          fallbackImage={shape.image}
                          descriptionLabel={t("optionDescriptionLabel")}
                          bestForLabel={t("optionBestForLabel")}
                          viewImageHint={t("optionViewImageHint")}
                          backToDetailsHint={t("optionBackToDetailsHint")}
                          foilCheckboxLabel={t("optionFoilCheckboxLabel")}
                          doubleSidedCheckboxLabel={t("optionDoubleSidedCheckboxLabel")}
                          hideFoilCheckbox={opt.hideFoilCheckbox}
                          hideDoubleSidedCheckbox={opt.hideDoubleSidedCheckbox}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {((shape.materials && shape.materials.length > 0) || (subgroup.materials && subgroup.materials.length > 0)) && (
        <MaterialGlossaryFab />
      )}

      {/* ── Quote CTA banner ── */}
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
                <span className="text-brand-primary">{shapeName}</span>?
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

      {/* ── Shape navigation footer ── */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          {prevShape ? (
            <Link
              href={`/products/${subgroup.categoryId}/${subgroup.id}/${prevShape.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">
                {pickLocale(locale, prevShape.nameVi, prevShape.nameEn, prevShape.nameZh, prevShape.nameJa, prevShape.nameKo)}
              </span>
              <span className="sm:hidden">{t("prevShort")}</span>
            </Link>
          ) : (
            <Link
              href={`/products/${subgroup.categoryId}/${subgroup.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{subgroupTitle}</span>
            </Link>
          )}

          <Link
            href={`/products/${subgroup.categoryId}/${subgroup.id}`}
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            {locale === "vi" ? `Xem tất cả hình thức của ${subgroupTitle}` : `All shapes of ${subgroupTitle}`}
          </Link>

          {nextShape ? (
            <Link
              href={`/products/${subgroup.categoryId}/${subgroup.id}/${nextShape.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <span className="hidden sm:inline">
                {pickLocale(locale, nextShape.nameVi, nextShape.nameEn, nextShape.nameZh, nextShape.nameJa, nextShape.nameKo)}
              </span>
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
