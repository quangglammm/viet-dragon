import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { FloatingContact } from "@/components/ui/floating-contact";
import { LanguageDetectorToast } from "@/components/ui/language-detector-toast";
import { routing } from "@/i18n/routing";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Outfit (the reference theme's heading font) only ships latin/latin-ext subsets —
// no Vietnamese diacritics. Plus Jakarta Sans has the same geometric/rounded
// display character and full Vietnamese subset support.
const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const meta: Record<string, { title: string; description: string }> = {
    vi: {
      title: "Viet Dragon – In Ấn Chuyên Nghiệp | Premium Printing Services",
      description:
        "Viet Dragon – dịch vụ in ấn chuyên nghiệp tại TP. Hồ Chí Minh & Bình Dương. Danh thiếp, catalogue, hộp giấy, decal. Tư vấn, thiết kế, in thử, giao hàng miễn phí.",
    },
    en: {
      title: "Viet Dragon – Professional Printing Services",
      description:
        "Viet Dragon – professional printing services in Ho Chi Minh City & Binh Duong. Business cards, catalogues, paper boxes, decals. Free consultation, design, and sample printing.",
    },
    zh: {
      title: "Viet Dragon – 越南高端专业印刷服务商",
      description:
        "Viet Dragon – 胡志明市与平阳省专业高品质印刷服务。商务名片、企业画册、精品礼盒、不干胶贴纸。免费咨询、设计、打样及配送。",
    },
    ja: {
      title: "Viet Dragon – ベトナム・プロフェッショナル高品質印刷",
      description:
        "Viet Dragon – ホーチミン市＆ビンズオン省のプロフェッショナル印刷サービス。名刺、カタログ、化粧箱、シール印刷。無料相談・デザイン・サンプル校正・無料配送。",
    },
    ko: {
      title: "Viet Dragon – 베트남 전문 프리미엄 인쇄 제작 서비스",
      description:
        "Viet Dragon – 호치민시 및 빈증성 전문 프리미엄 인쇄 서비스. 명함, 카탈로그, 종이 박스, 스티커 라벨. 1:1 무료 상담, 디자인, 샘플 인쇄 및 직배송.",
    },
  };

  return meta[locale] ?? meta.en;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${heading.variable} ${mono.variable} antialiased`}
    >
      <body>
        <NextIntlClientProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <FloatingContact />
          <LanguageDetectorToast />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
