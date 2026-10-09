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
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { MAIN_CATEGORIES, SUBGROUPS_CATALOG, getSubgroupById, getSubgroupsByCategory } from "@/data/subgroups-catalog";
import type { ProductOption } from "@/data/categories";
import { SubgroupShapesView } from "@/components/sections/SubgroupShapesView";
import { MaterialFlashcard } from "@/components/ui/material-flashcard";
import { MaterialGlossaryFab } from "@/components/ui/material-glossary-fab";
import { CATEGORY_NAMES, CATEGORY_DESCS, ITEM_NAMES, ITEM_DESCS } from "@/data/translations";
import { checkPublicImageExists, sanitizeOptionImages } from "@/lib/image-check";
import { resolveShapeAlias } from "@/lib/shape-aliases";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

export function generateStaticParams() {
  return SUBGROUPS_CATALOG.map((sub) => ({
    categoryId: sub.categoryId,
    productId: sub.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId, productId } = await params;
  
  // 1. Check Subgroup first
  const subgroup = getSubgroupById(productId, categoryId);
  if (subgroup) {
    const title = pickLocale(
      locale,
      subgroup.titleVi,
      subgroup.titleEn,
      subgroup.titleZh,
      subgroup.titleJa,
      subgroup.titleKo
    );
    const desc = pickLocale(locale, subgroup.descriptionVi, subgroup.descriptionEn);
    return {
      title: `${title} | Viet Dragon`,
      description: desc,
    };
  }

  // 2. Fallback to category metadata
  const cat = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return {};
  return {
    title: `${pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko)} | Viet Dragon`,
    description: pickLocale(locale, cat.descriptionVi, cat.description, CATEGORY_DESCS[cat.id]?.zh, CATEGORY_DESCS[cat.id]?.ja, CATEGORY_DESCS[cat.id]?.ko),
  };
}

export default async function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale; categoryId: string; productId: string }>;
}>) {
  const { locale, categoryId, productId } = await params;
  const cat = MAIN_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) notFound();

  const catName = pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko);

  // ── BRANCH 1: Subgroup Shapes Page (e.g. /products/marketing/poster-bangron-standee) ──
  const subgroup = getSubgroupById(productId, categoryId);
  if (subgroup && subgroup.shapes.length > 0) {
    return (
      <SubgroupShapesView
        locale={locale}
        subgroup={subgroup}
        categoryName={catName || subgroup.categoryId.toUpperCase()}
      />
    );
  }

  // ── BRANCH 2: Standard Product Detail Page / Direct Material Page ──
  const t = await getTranslations({ locale, namespace: "productDetailPage" });
  if (!subgroup) notFound();

  const item: {
    id: string;
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    description: string;
    image: string;
    optionGroups: { options: ProductOption[] }[];
    hideFoilCheckbox?: boolean;
    hideDoubleSidedCheckbox?: boolean;
  } = {
    id: subgroup.id,
    nameVi: subgroup.titleVi,
    nameEn: subgroup.titleEn,
    descriptionVi: subgroup.descriptionVi,
    description: subgroup.descriptionEn,
    image: subgroup.coverImage,
    optionGroups: subgroup.materials && subgroup.materials.length > 0 ? [{ options: subgroup.materials }] : [],
  };

  const name = pickLocale(
    locale,
    item.nameVi,
    item.nameEn,
    ITEM_NAMES[item.id]?.zh ?? subgroup.titleZh,
    ITEM_NAMES[item.id]?.ja ?? subgroup.titleJa,
    ITEM_NAMES[item.id]?.ko ?? subgroup.titleKo
  );
  const Icon = cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : Briefcase;

  const catSubgroups = getSubgroupsByCategory(cat.id);
  const navItems = catSubgroups.map((s) => ({
    id: s.id,
    nameVi: s.titleVi,
    nameEn: s.titleEn,
    nameZh: s.titleZh,
    nameJa: s.titleJa,
    nameKo: s.titleKo,
  }));

  const idx = navItems.findIndex((i) => i.id === productId);
  const prev = idx > 0 ? navItems[idx - 1] : null;
  const next = idx >= 0 && idx < navItems.length - 1 ? navItems[idx + 1] : null;

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
          <div className="aspect-square rounded-2xl border border-zinc-100 overflow-hidden bg-zinc-100 lg:sticky lg:top-28">
            <div className="relative w-full h-full">
              {checkPublicImageExists(item.image) ? (
                <Image
                  src={item.image}
                  alt={name}
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
                    {name}
                  </span>
                </div>
              )}
            </div>
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
              {pickLocale(locale, item.descriptionVi, item.description, ITEM_DESCS[item.id]?.zh, ITEM_DESCS[item.id]?.ja, ITEM_DESCS[item.id]?.ko)}
            </p>

            {item.optionGroups && item.optionGroups.length > 0 && (
              <div className="flex flex-col gap-8 mt-2">
                {item.optionGroups.map((group) => (
                  <div
                    key={group.options.map((opt) => opt.name).join("-")}
                    className="flex flex-col gap-6"
                  >
                    {group.options.map((opt) => (
                      <div key={opt.name} id={resolveShapeAlias(opt.nameVi)} className="scroll-mt-28">
                        <p className="font-black text-zinc-900 text-[15px] leading-snug mb-2.5">
                          {pickLocale(locale, opt.taglineVi, opt.tagline, opt.taglineZh, opt.taglineJa, opt.taglineKo)}
                        </p>
                        <MaterialFlashcard
                          option={sanitizeOptionImages(opt)}
                          locale={locale}
                          productName={name}
                          fallbackImage={item.image}
                          descriptionLabel={t("optionDescriptionLabel")}
                          bestForLabel={t("optionBestForLabel")}
                          viewImageHint={t("optionViewImageHint")}
                          backToDetailsHint={t("optionBackToDetailsHint")}
                          foilCheckboxLabel={t("optionFoilCheckboxLabel")}
                          doubleSidedCheckboxLabel={t("optionDoubleSidedCheckboxLabel")}
                          hideFoilCheckbox={opt.hideFoilCheckbox ?? item.hideFoilCheckbox}
                          hideDoubleSidedCheckbox={opt.hideDoubleSidedCheckbox ?? item.hideDoubleSidedCheckbox}
                          productId={productId}
                          categoryId={categoryId}
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
              <span className="hidden sm:inline">
                {pickLocale(
                  locale,
                  prev.nameVi,
                  prev.nameEn,
                  ITEM_NAMES[prev.id]?.zh ?? prev.nameZh,
                  ITEM_NAMES[prev.id]?.ja ?? prev.nameJa,
                  ITEM_NAMES[prev.id]?.ko ?? prev.nameKo
                )}
              </span>
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
              <span className="hidden sm:inline">
                {pickLocale(
                  locale,
                  next.nameVi,
                  next.nameEn,
                  ITEM_NAMES[next.id]?.zh ?? next.nameZh,
                  ITEM_NAMES[next.id]?.ja ?? next.nameJa,
                  ITEM_NAMES[next.id]?.ko ?? next.nameKo
                )}
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
