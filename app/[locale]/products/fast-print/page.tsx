import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFastPrint } from "@/lib/content/read/load";
import { fastPrintCardsOf } from "@/lib/content/read/merchandising";
import { breadcrumbLd, metadataFor } from "@/lib/content/read/page-seo";
import { samePath } from "@/lib/content/read/seo";
import { JsonLd } from "@/components/seo/json-ld";
import FastPrintClient from "./FastPrintClient";
import { localeOf } from "@/lib/route-locale";

// Rendered on its first request (the locale layout reads the content database) and cached — see app/[locale]/layout.tsx.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale: localeSegment } = await params;
  const locale = localeOf(localeSegment);
  const t = await getTranslations({ locale, namespace: "fastPrint" });
  return metadataFor({ locale, meta: { title: t("metaTitle"), description: t("metaDescription"), image: null }, paths: samePath("/products/fast-print") });
}

export default async function FastPrintPage({ params }: Readonly<{ params: Promise<{ locale: Locale }> }>) {
  const { locale: localeSegment } = await params;
  const locale = localeOf(localeSegment);
  const t = await getTranslations({ locale, namespace: "fastPrint" });
  const crumbs = [
    { name: t("breadcrumbHome"), path: "/" },
    { name: t("breadcrumbProducts"), path: "/products" },
    { name: t("breadcrumbCurrent"), path: "/products/fast-print" },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, crumbs)} />
      <FastPrintClient items={fastPrintCardsOf(await getFastPrint(), locale)} />
    </>
  );
}
