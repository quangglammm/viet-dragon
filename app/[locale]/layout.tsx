import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { QuoteModalProvider } from "@/components/providers/quote-modal-provider";
import { SiteDataProvider } from "@/components/providers/site-data-provider";
import { FloatingContact } from "@/components/ui/floating-contact";
import { LanguageDetectorToast } from "@/components/ui/language-detector-toast";
import { routing } from "@/i18n/routing";
import { getNavigation } from "@/lib/content/read/site";
import { getSiteEnv } from "@/lib/env";

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

// Nothing under [locale] is prerendered: every page reads the content database, so each is rendered on its first request and cached
// until a publish revalidates what it read (and `next build` needs no database).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "siteMeta" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(getSiteEnv().SITE_URL),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
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
  const navigation = await getNavigation(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${heading.variable} ${mono.variable} antialiased`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <SiteDataProvider navigation={navigation}>
            <QuoteModalProvider>
              <SmoothScroll>{children}</SmoothScroll>
              <FloatingContact />
              <LanguageDetectorToast />
            </QuoteModalProvider>
          </SiteDataProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
