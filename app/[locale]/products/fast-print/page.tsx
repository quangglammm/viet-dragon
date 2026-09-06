import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import FastPrintClient from "./FastPrintClient";

export function generateStaticParams() {
  return [
    { locale: "vi" },
    { locale: "en" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === "vi";
  return {
    title: isVi
      ? "In Nhanh Lấy Liền | Viet Dragon – In Ấn Chuyên Nghiệp"
      : "Fast Print Express | Viet Dragon – Professional Printing",
    description: isVi
      ? "In nhanh lấy liền trong ngày — danh thiếp, tờ rơi, voucher, tem nhãn — giao tận nơi TP.HCM & Bình Dương trong 2–6 giờ, chuẩn màu 100%."
      : "Same-day express printing — business cards, flyers, vouchers, labels — delivered across HCM City & Binh Duong in 2–6 hours.",
  };
}

export default async function FastPrintPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  return <FastPrintClient locale={locale} />;
}
