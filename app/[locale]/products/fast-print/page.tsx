import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFastPrint } from "@/lib/content/read/load";
import { fastPrintCardsOf } from "@/lib/content/read/merchandising";
import FastPrintClient from "./FastPrintClient";

// Rendered on its first request (the locale layout reads the content database) and cached — see app/[locale]/layout.tsx.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fastPrint" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function FastPrintPage({ params }: Readonly<{ params: Promise<{ locale: Locale }> }>) {
  const { locale } = await params;
  return <FastPrintClient items={fastPrintCardsOf(await getFastPrint(), locale)} />;
}
