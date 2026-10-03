import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles,
  ArrowLeft, ArrowRight, type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { CATEGORY_NAMES, CATEGORY_DESCS, ITEM_NAMES, ITEM_DESCS } from "@/data/translations";
import { getSubgroupsByCategory, getSubgroupById } from "@/data/subgroups-catalog";
import { TET_SUBMENU_COLUMNS } from "@/data/tet-menu";

interface DisplayProductItem {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh?: string;
  nameJa?: string;
  nameKo?: string;
  descriptionVi: string;
  description: string;
  image: string;
  images?: string[];
  href?: string;
  optionGroups?: Array<{ options: Array<{ images?: string[]; pureImages?: string[] }> }>;
  shapes?: Array<{
    id: string;
    nameVi: string;
    nameEn: string;
    nameZh?: string;
    nameJa?: string;
    nameKo?: string;
  }>;
}

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };

export function generateStaticParams() {
  return productCategories.map((cat) => ({ categoryId: cat.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; categoryId: string }>;
}): Promise<Metadata> {
  const { locale, categoryId } = await params;
  const cat = productCategories.find((c) => c.id === categoryId);
  if (!cat) return {};
  return {
    title: `${pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko)} | Viet Dragon`,
    description: pickLocale(locale, cat.descriptionVi, cat.description, CATEGORY_DESCS[cat.id]?.zh, CATEGORY_DESCS[cat.id]?.ja, CATEGORY_DESCS[cat.id]?.ko),
  };
}

export default async function CategoryPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale; categoryId: string }>;
}>) {
  const { locale, categoryId } = await params;
  const t = await getTranslations({ locale, namespace: "categoryPage" });
  const cat = productCategories.find((c) => c.id === categoryId);
  if (!cat) notFound();

  const name = pickLocale(locale, cat.nameVi, cat.nameEn, CATEGORY_NAMES[cat.id]?.zh, CATEGORY_NAMES[cat.id]?.ja, CATEGORY_NAMES[cat.id]?.ko);
  const Icon = iconMap[cat.icon] ?? Briefcase;
  const idx = productCategories.findIndex((c) => c.id === categoryId);
  const prev = idx > 0 ? productCategories[idx - 1] : null;
  const next = idx < productCategories.length - 1 ? productCategories[idx + 1] : null;

  // When categoryId is "tet", load the 8 product groups from TET_SUBMENU_COLUMNS so items match the megamenu exactly!
  let items: DisplayProductItem[] = [];
  if (categoryId === "tet") {
    items = TET_SUBMENU_COLUMNS.flatMap((col) => col.groups).map((group) => {
      const sub = getSubgroupById(group.id, categoryId);
      return {
        id: group.id,
        nameVi: group.titleVi,
        nameEn: group.titleEn,
        nameZh: group.titleZh ?? sub?.titleZh,
        nameJa: group.titleJa ?? sub?.titleJa,
        nameKo: group.titleKo ?? sub?.titleKo,
        descriptionVi: sub?.descriptionVi ?? "",
        description: sub?.descriptionEn ?? "",
        image: group.image,
        images: [group.image, ...(sub?.shapes.map((s) => s.image) ?? [])],
        href: group.href,
        optionGroups: sub?.materials && sub.materials.length > 0 ? [{ options: sub.materials }] : [],
        shapes: sub?.shapes,
      };
    });
  } else {
    const subgroups = getSubgroupsByCategory(categoryId);
    items = subgroups.length > 0
      ? subgroups.map((sub) => ({
          id: sub.id,
          nameVi: sub.titleVi,
          nameEn: sub.titleEn,
          nameZh: sub.titleZh,
          nameJa: sub.titleJa,
          nameKo: sub.titleKo,
          descriptionVi: sub.descriptionVi,
          description: sub.descriptionEn,
          image: sub.coverImage,
          images: [sub.coverImage, ...sub.shapes.map((s) => s.image)],
          optionGroups: sub.materials?.length > 0 ? [{ options: sub.materials }] : [],
          shapes: sub.shapes,
        }))
      : cat.items;
  }

  return (
    <div className="bg-white">
      {/* ── Full-width hero image ── */}
      <div className="relative h-[420px] lg:h-[520px] w-full overflow-hidden">
        <Image
          src={cat.coverImage}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover"
          preload
        />
        {/* Dark overlay + content */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-zinc-950/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
            {/* Breadcrumb over image */}
            <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/50 mb-6">
              <Link href="/" className="hover:text-white transition-colors">{t("breadcrumbHome")}</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-white transition-colors">{t("breadcrumbProducts")}</Link>
              <span>/</span>
              <span className="text-white/80">{name}</span>
            </nav>

            <div className="flex items-end gap-5">
              <span className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white shrink-0">
                <Icon size={28} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-1">
                  {t("eyebrow")}
                </p>
                <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
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
            {pickLocale(locale, cat.descriptionVi, cat.description, CATEGORY_DESCS[cat.id]?.zh, CATEGORY_DESCS[cat.id]?.ja, CATEGORY_DESCS[cat.id]?.ko)}
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
            const itemHref = item.href ?? `/products/${cat.id}/${item.id}`;
            const itemName = pickLocale(
              locale,
              item.nameVi,
              item.nameEn,
              item.nameZh ?? ITEM_NAMES[item.id]?.zh,
              item.nameJa ?? ITEM_NAMES[item.id]?.ja,
              item.nameKo ?? ITEM_NAMES[item.id]?.ko
            );
            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-md transition-all duration-300"
              >
                {/* Item image */}
                <Link href={itemHref} className="relative h-52 overflow-hidden bg-zinc-100 block">
                  <Image
                    src={item.image}
                    alt={itemName}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Item info */}
                <div className="flex flex-col gap-2 p-5 flex-1 bg-white">
                  <div>
                    <Link href={itemHref} className="font-black text-zinc-900 text-base hover:text-brand-primary transition-colors">
                      {itemName}
                    </Link>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                    {pickLocale(
                      locale,
                      item.descriptionVi,
                      item.description,
                      ITEM_DESCS[item.id]?.zh,
                      ITEM_DESCS[item.id]?.ja,
                      ITEM_DESCS[item.id]?.ko
                    )}
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
            {items.map((item) => {
              let refImage = item.image;
              
              if (item.images && item.images.length > 1) {
                const altImg = item.images.find((img) => img !== item.image);
                if (altImg) refImage = altImg;
              } else if (item.optionGroups && item.optionGroups.length > 0) {
                const allMaterialImages: string[] = [];
                for (const group of item.optionGroups) {
                  for (const option of group.options) {
                    if (option.images) allMaterialImages.push(...option.images);
                    if (option.pureImages) allMaterialImages.push(...option.pureImages);
                  }
                }
                
                const uniqueImages = allMaterialImages.filter((img) => img !== item.image);
                if (uniqueImages.length >= 2) {
                  refImage = uniqueImages[1]; 
                } else if (uniqueImages.length === 1) {
                  refImage = uniqueImages[0];
                }
              }

              return (
                <div key={item.id} className="relative rounded-xl overflow-hidden group h-32 sm:h-36 lg:h-40">
                  <Image
                    src={refImage}
                    alt={pickLocale(
                      locale,
                      item.nameVi,
                      item.nameEn,
                      item.nameZh ?? ITEM_NAMES[item.id]?.zh,
                      item.nameJa ?? ITEM_NAMES[item.id]?.ja,
                      item.nameKo ?? ITEM_NAMES[item.id]?.ko
                    )}
                    fill
                    sizes={items.length === 8 ? "(min-width: 1024px) 12.5vw, (min-width: 640px) 25vw, 50vw" : "(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              );
            })}
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
              href={`/products/${prev.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{pickLocale(locale, prev.nameVi, prev.nameEn, CATEGORY_NAMES[prev.id]?.zh, CATEGORY_NAMES[prev.id]?.ja, CATEGORY_NAMES[prev.id]?.ko)}</span>
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
              href={`/products/${next.id}`}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors group"
            >
              <span className="hidden sm:inline">{pickLocale(locale, next.nameVi, next.nameEn, CATEGORY_NAMES[next.id]?.zh, CATEGORY_NAMES[next.id]?.ja, CATEGORY_NAMES[next.id]?.ko)}</span>
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
