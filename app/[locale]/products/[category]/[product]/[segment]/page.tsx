import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { glossaryOf, productPageOf } from "@/lib/content/read/pages";
import { peekPage, resolvePage } from "@/lib/content/read/resolve-page";
import { ProductDetailView } from "@/components/sections/ProductDetailView";

type SegmentParams = { locale: Locale; category: string; product: string; segment: string };

export async function generateMetadata({ params }: { params: Promise<SegmentParams> }): Promise<Metadata> {
  const { locale, category, product, segment } = await params;
  const found = await peekPage(locale, { category, product, segment });
  if (!found?.product) return {};
  return productPageOf(found.catalog, locale, found.category, found.product, found.target).meta;
}

export default async function SegmentPage({ params }: Readonly<{ params: Promise<SegmentParams> }>) {
  const { locale, category, product, segment } = await params;
  const found = await resolvePage(locale, { category, product, segment });
  if (!found.product || !found.target) throw new Error("a segment URL resolved without a product and a target");
  const model = productPageOf(found.catalog, locale, found.category, found.product, found.target);
  if (model.kind === "shapes") throw new Error("a segment URL resolved to a shapes grid");
  return <ProductDetailView locale={locale} model={model} traits={glossaryOf(found.catalog, locale)} />;
}
