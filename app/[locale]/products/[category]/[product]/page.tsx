import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { glossaryOf, productPageOf } from "@/lib/content/read/pages";
import { peekPage, resolvePage } from "@/lib/content/read/resolve-page";
import { ProductDetailView } from "@/components/sections/ProductDetailView";
import { SubgroupShapesView } from "@/components/sections/SubgroupShapesView";

type ProductParams = { locale: Locale; category: string; product: string };

export async function generateMetadata({ params }: { params: Promise<ProductParams> }): Promise<Metadata> {
  const { locale, category, product } = await params;
  const found = await peekPage(locale, { category, product });
  if (!found?.product) return {};
  return productPageOf(found.catalog, locale, found.category, found.product, null).meta;
}

export default async function ProductPage({ params }: Readonly<{ params: Promise<ProductParams> }>) {
  const { locale, category, product } = await params;
  const found = await resolvePage(locale, { category, product });
  if (!found.product) throw new Error("a product URL resolved without a product");
  const model = productPageOf(found.catalog, locale, found.category, found.product, null);
  if (model.kind === "shapes") return <SubgroupShapesView locale={locale} model={model} />;
  return <ProductDetailView locale={locale} model={model} traits={glossaryOf(found.catalog, locale)} />;
}
