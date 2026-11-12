import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { glossaryOf, productPageOf } from "@/lib/content/read/pages";
import { breadcrumbLd, metadataFor, productCrumbs } from "@/lib/content/read/page-seo";
import { peekPage, resolvePage } from "@/lib/content/read/resolve-page";
import { alternatePaths, segmentPath } from "@/lib/content/read/urls";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductDetailView } from "@/components/sections/ProductDetailView";
import { localeOf } from "@/lib/route-locale";

type SegmentParams = { locale: Locale; category: string; product: string; segment: string };

export async function generateMetadata({ params }: { params: Promise<SegmentParams> }): Promise<Metadata> {
  const { locale: localeSegment, category, product, segment } = await params;
  const locale = localeOf(localeSegment);
  const found = await peekPage(locale, { category, product, segment });
  if (!found?.product) return {};
  return metadataFor({ locale, meta: productPageOf(found.catalog, locale, found.category, found.product, found.target).meta, paths: alternatePaths(found.catalog, found.category, found.product, found.target) });
}

export default async function SegmentPage({ params }: Readonly<{ params: Promise<SegmentParams> }>) {
  const { locale: localeSegment, category, product, segment } = await params;
  const locale = localeOf(localeSegment);
  const found = await resolvePage(locale, { category, product, segment });
  if (!found.product || !found.target) throw new Error("a segment URL resolved without a product and a target");
  const model = productPageOf(found.catalog, locale, found.category, found.product, found.target);
  if (model.kind === "shapes" || model.kind === "detail") throw new Error(`a segment URL resolved to a ${model.kind} page`);
  const last = { name: model.kind === "shape" ? model.shape.name : model.material.name, path: segmentPath(found.catalog, locale, found.product, found.target) };
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, await productCrumbs(locale, model.context, last))} />
      <ProductDetailView locale={locale} model={model} traits={glossaryOf(found.catalog, locale)} />
    </>
  );
}
