import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import FastPrintClient from "./FastPrintClient";

import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta: Record<Locale, { title: string; description: string }> = {
    vi: {
      title: "In Nhanh Lấy Liền | Viet Dragon – In Ấn Chuyên Nghiệp",
      description:
        "In nhanh lấy liền trong ngày — danh thiếp, tờ rơi, voucher, tem nhãn — giao tận nơi TP.HCM & Bình Dương trong 2–6 giờ, chuẩn màu 100%.",
    },
    en: {
      title: "Fast Print Express | Viet Dragon – Professional Printing",
      description:
        "Same-day express printing — business cards, flyers, vouchers, labels — delivered across HCM City & Binh Duong in 2–6 hours.",
    },
    zh: {
      title: "极速快印 现印现取 | Viet Dragon – 越南专业印刷",
      description:
        "当天数码极速快印 —— 商务名片、宣传单页、优惠券、不干胶标签，胡志明市及平阳省2–6小时闪电送达，100%精准色彩。",
    },
    ja: {
      title: "特急スピード印刷 即日仕上げ | Viet Dragon – ベトナム高品質印刷",
      description:
        "当日仕上げのデジタル特急印刷 — 名刺、チラシ、クーポン、ラベルシール。ホーチミン市＆ビンズオン省へ2〜6時間でお届け、正確な色再現。",
    },
    ko: {
      title: "당일 특급 인쇄 즉시 출고 | Viet Dragon – 베트남 전문 인쇄",
      description:
        "당일 출고 초고속 디지털 인쇄 — 명함, 전단지, 쿠폰, 라벨 스티커. 호치민 및 빈증 전역 2~6시간 내 신속 배송, 100% 표준 색상 보장.",
    },
  };

  return meta[locale] ?? meta.en;
}

export default async function FastPrintPage({
  params,
}: Readonly<{
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  return <FastPrintClient locale={locale} />;
}
