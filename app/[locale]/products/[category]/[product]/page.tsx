import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { glossaryOf, productPageOf } from "@/lib/content/read/pages";
import { breadcrumbLd, metadataFor, productCrumbs } from "@/lib/content/read/page-seo";
import { peekPage, resolvePage } from "@/lib/content/read/resolve-page";
import { alternatePaths } from "@/lib/content/read/urls";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductDetailView } from "@/components/sections/ProductDetailView";
import { SubgroupShapesView } from "@/components/sections/SubgroupShapesView";
import { localeOf } from "@/lib/route-locale";

type ProductParams = { locale: Locale; category: string; product: string };

export async function generateMetadata({ params }: { params: Promise<ProductParams> }): Promise<Metadata> {
  const { locale: localeSegment, category, product } = await params;
  const locale = localeOf(localeSegment);
  const found = await peekPage(locale, { category, product });
  if (!found?.product) return {};
  return metadataFor({ locale, meta: productPageOf(found.catalog, locale, found.category, found.product, null).meta, paths: alternatePaths(found.catalog, found.category, found.product, null) });
}

export default async function ProductPage({ params }: Readonly<{ params: Promise<ProductParams> }>) {
  const { locale: localeSegment, category, product } = await params;
  const locale = localeOf(localeSegment);
  const found = await resolvePage(locale, { category, product });
  if (!found.product) throw new Error("a product URL resolved without a product");
  const model = productPageOf(found.catalog, locale, found.category, found.product, null);
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, await productCrumbs(locale, model.context))} />
      {model.kind === "shapes" ? <SubgroupShapesView model={model} /> : <ProductDetailView locale={locale} model={model} traits={glossaryOf(found.catalog, locale)} />}
    </>
  );
}
