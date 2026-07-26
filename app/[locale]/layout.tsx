import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { FloatingContact } from "@/components/ui/floating-contact";
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

  return locale === "vi"
    ? {
        title: "Viet Dragon – In Ấn Chuyên Nghiệp | Premium Printing Services",
        description:
          "Viet Dragon – dịch vụ in ấn chuyên nghiệp tại TP. Hồ Chí Minh & Bình Dương. Danh thiếp, catalogue, hộp giấy, decal. Tư vấn, thiết kế, in thử, giao hàng miễn phí.",
      }
    : {
        title: "Viet Dragon – Professional Printing Services",
        description:
          "Viet Dragon – professional printing services in Ho Chi Minh City & Binh Duong. Business cards, catalogues, paper boxes, decals. Free consultation, design, and sample printing.",
      };
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
