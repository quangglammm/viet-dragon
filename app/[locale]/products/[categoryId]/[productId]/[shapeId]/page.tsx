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
import { AutoScrollToTarget } from "@/components/ui/auto-scroll-to-target";
import { CATEGORY_NAMES } from "@/data/translations";
import { checkPublicImageExists, sanitizeOptionImages } from "@/lib/image-check";
import { SHAPE_ALIASES, toSlug } from "@/lib/shape-aliases";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

export function generateStaticParams() {
  return SUBGROUPS_CATALOG.flatMap((sub) => {
    const shapeParams = sub.shapes.map((shape) => ({
      categoryId: sub.categoryId,
      productId: sub.id,
      shapeId: shape.id,
    }));

    const matSlugs = new Set<string>();
    const allMaterials = [
      ...(sub.materials || []),
      ...sub.shapes.flatMap((s) => s.materials || []),
    ];
    for (const m of allMaterials) {
      if (m.nameVi) matSlugs.add(toSlug(m.nameVi));
      if (m.name) matSlugs.add(toSlug(m.name));
    }

    // Include aliases mapping to materials
    for (const [alias, target] of Object.entries(SHAPE_ALIASES)) {
      if (Array.from(matSlugs).some((s) => s === target || s === alias)) {
        matSlugs.add(alias);
      }
    }

    const materialParams = Array.from(matSlugs)
      .filter((slug) => !sub.shapes.some((s) => s.id === slug))
      .map((slug) => ({
        categoryId: sub.categoryId,
        productId: sub.id,
        shapeId: slug,
      }));

    return [...shapeParams, ...materialParams];
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string; shapeId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId, productId, shapeId } = await params;
  const subgroup = getSubgroupById(productId, categoryId);
  if (!subgroup) return {};

  const resolvedId = SHAPE_ALIASES[shapeId] ?? shapeId;
  const shape = subgroup.shapes.find((s) => s.id === shapeId || s.id === resolvedId);
  const subgroupTitle = pickLocale(locale, subgroup.titleVi, subgroup.titleEn, subgroup.titleZh, subgroup.titleJa, subgroup.titleKo);

  if (shape) {
    const shapeName = pickLocale(locale, shape.nameVi, shape.nameEn, shape.nameZh, shape.nameJa, shape.nameKo);
    return {
      title: `${shapeName} - ${subgroupTitle} | Viet Dragon`,
      description: pickLocale(locale, shape.descriptionVi, shape.descriptionEn),
    };
  }

  // Material mode
  const allMaterials = [
    ...(subgroup.materials || []),
    ...subgroup.shapes.flatMap((s) => s.materials || []),
  ];
  const matchedMat = allMaterials.find((m) => {
    const sVi = toSlug(m.nameVi);
    const sEn = toSlug(m.name);
    return sVi === shapeId || sVi === resolvedId || sEn === shapeId || sEn === resolvedId;
  });

  if (matchedMat) {
    const matName = pickLocale(locale, matchedMat.nameVi, matchedMat.name, matchedMat.nameZh, matchedMat.nameJa, matchedMat.nameKo);
    return {
      title: `${subgroupTitle} - ${matName} | Viet Dragon`,
      description: pickLocale(locale, subgroup.descriptionVi, subgroup.descriptionEn),
    };
  }

  return {};
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

  const resolvedId = SHAPE_ALIASES[shapeId] ?? shapeId;
  const shape = subgroup.shapes.find((s) => s.id === shapeId || s.id === resolvedId);

  // Material fallback resolution
  const allMaterials = [
    ...(subgroup.materials || []),
    ...subgroup.shapes.flatMap((s) => s.materials || []),
  ];
  const matchedMat = !shape
    ? allMaterials.find((m) => {
        const sVi = toSlug(m.nameVi);
        const sEn = toSlug(m.name);
        return sVi === shapeId || sVi === resolvedId || sEn === shapeId || sEn === resolvedId;
      })
    : null;

  if (!shape && !matchedMat) {
    notFound();
  }

  const cat = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  const catName = cat
    ? pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko)
    : subgroup.categoryId.toUpperCase();
  const Icon = cat ? (iconMap[cat.icon] ?? Briefcase) : Layers;

  const subgroupTitle = pickLocale(locale, subgroup.titleVi, subgroup.titleEn, subgroup.titleZh, subgroup.titleJa, subgroup.titleKo);

  // Content configuration according to Shape mode vs Material mode
  const isMaterialMode = Boolean(matchedMat);
  const shapeName = shape
    ? pickLocale(locale, shape.nameVi, shape.nameEn, shape.nameZh, shape.nameJa, shape.nameKo)
    : "";
  const pageTitle = isMaterialMode ? subgroupTitle : shapeName;
  const displayImage = isMaterialMode ? subgroup.coverImage : (shape?.image || subgroup.coverImage);
  const displayImageAlt = isMaterialMode ? subgroupTitle : shapeName;
  const pageDesc = isMaterialMode
    ? pickLocale(locale, subgroup.descriptionVi, subgroup.descriptionEn)
    : pickLocale(locale, shape?.descriptionVi || "", shape?.descriptionEn || "");

  const breadcrumbLast = isMaterialMode && matchedMat
    ? pickLocale(locale, matchedMat.nameVi, matchedMat.name, matchedMat.nameZh, matchedMat.nameJa, matchedMat.nameKo)
    : shapeName;

  // Materials list to display
  const displayMaterials = isMaterialMode
    ? (subgroup.materials && subgroup.materials.length > 0 ? subgroup.materials : allMaterials)
    : (shape?.materials && shape.materials.length > 0 ? shape.materials : subgroup.materials);

  const targetMaterialSlug = matchedMat ? toSlug(matchedMat.nameVi) : null;

  // Pagination across shapes within this subgroup (applicable when in shape mode)
  const shapeIdx = shape ? subgroup.shapes.findIndex((s) => s.id === shape.id) : -1;
  const prevShape = shapeIdx > 0 ? subgroup.shapes[shapeIdx - 1] : null;
  const nextShape = shapeIdx >= 0 && shapeIdx < subgroup.shapes.length - 1 ? subgroup.shapes[shapeIdx + 1] : null;

  return (
    <div className="bg-white">
      {/* Auto-scroll controller for material deep-link or hash navigation */}
      <AutoScrollToTarget targetId={targetMaterialSlug || undefined} altTargetId={shapeId} />

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
          <span className="text-zinc-700 font-medium">{breadcrumbLast}</span>
        </nav>
      </div>

      {/* ── Product panel (Exact 2-column layout with preserved aspect-square frame) ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left sticky square image */}
          <div className="aspect-square rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <div className="relative w-full h-full">
              {checkPublicImageExists(displayImage) ? (
                <Image
                  src={displayImage}
                  alt={displayImageAlt}
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
                    {displayImageAlt}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Info, Subgroup Switcher, & Material Flashcards */}
          <div className="flex flex-col gap-6">
            <Link
              href={`/products/${subgroup.categoryId}/${subgroup.id}`}
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs font-semibold hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              <Icon size={13} strokeWidth={1.5} /> {subgroupTitle}
            </Link>

            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 leading-tight">
              {pageTitle}
            </h1>

            <p className="text-zinc-500 leading-relaxed">
              {pageDesc}
            </p>

            {/* Material Flashcards stack */}
            {(() => {
              if (!displayMaterials || displayMaterials.length === 0) return null;

              return (
                <div className="flex flex-col gap-8 mt-2">
                  <div className="flex flex-col gap-6">
                    {displayMaterials.map((opt) => {
                      const slug = toSlug(opt.nameVi);
                      const matchingAliases = Object.entries(SHAPE_ALIASES)
                        .filter(([key, val]) => (val === slug || val === toSlug(opt.name)) && key !== slug)
                        .map(([key]) => key);

                      const isTargetMaterial = Boolean(
                        isMaterialMode &&
                          (slug === targetMaterialSlug ||
                            slug === shapeId ||
                            matchingAliases.includes(shapeId) ||
                            matchingAliases.includes(resolvedId))
                      );

                      return (
                        <div
                          key={opt.name}
                          id={slug}
                          className={cn(
                            "scroll-mt-28 lg:scroll-mt-32 relative transition-all duration-300",
                            isTargetMaterial && "ring-2 ring-brand-primary ring-offset-4 rounded-2xl p-1"
                          )}
                        >
                          {matchingAliases.map((alias) => (
                            <span key={alias} id={alias} className="sr-only scroll-mt-28 lg:scroll-mt-32" />
                          ))}
                          <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">
                            {pickLocale(locale, opt.taglineVi, opt.tagline, opt.taglineZh, opt.taglineJa, opt.taglineKo)}
                          </p>
                          <MaterialFlashcard
                            option={sanitizeOptionImages(opt)}
                            locale={locale}
                            productName={`${pageTitle} - ${pickLocale(locale, opt.nameVi, opt.name, opt.nameZh, opt.nameJa, opt.nameKo)}`}
                            fallbackImage={displayImage}
                            descriptionLabel={t("optionDescriptionLabel")}
                            bestForLabel={t("optionBestForLabel")}
                            viewImageHint={t("optionViewImageHint")}
                            backToDetailsHint={t("optionBackToDetailsHint")}
                            foilCheckboxLabel={t("optionFoilCheckboxLabel")}
                            doubleSidedCheckboxLabel={t("optionDoubleSidedCheckboxLabel")}
                            hideFoilCheckbox={opt.hideFoilCheckbox}
                            hideDoubleSidedCheckbox={opt.hideDoubleSidedCheckbox}
                            productId={productId}
                            shapeId={shape?.id || shapeId}
                            categoryId={categoryId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {((shape?.materials && shape.materials.length > 0) || (subgroup.materials && subgroup.materials.length > 0)) && (
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
                <span className="text-brand-primary">{pageTitle}</span>?
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
