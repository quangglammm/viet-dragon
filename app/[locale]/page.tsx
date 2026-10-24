import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import ShopCategories from "@/components/sections/ShopCategories";
import ShopBanner from "@/components/sections/ShopBanner";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Shop from "@/components/sections/Shop";
import CtaBanner from "@/components/sections/CtaBanner";
import Portfolio from "@/components/sections/Portfolio";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Quality from "@/components/sections/Quality";
import Process from "@/components/sections/Process";
import BlogPreview from "@/components/sections/BlogPreview";
import Brands from "@/components/sections/Brands";
import CTA from "@/components/sections/CTA";
import PartnerLogos from "@/components/sections/PartnerLogos";
import Footer from "@/components/sections/Footer";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getBlog, getCatalog } from "@/lib/content/read/load";
import { blogPreviewOf } from "@/lib/content/read/posts";
import { canonicalCatalogHref } from "@/lib/content/read/urls";
import { metadataFor, siteLd } from "@/lib/content/read/page-seo";
import { samePath } from "@/lib/content/read/seo";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "siteMeta" });
  return metadataFor({ locale, meta: { title: t("title"), description: t("description"), image: null }, paths: samePath("/") });
}

export default async function Home({ params }: Readonly<{ params: Promise<{ locale: Locale }> }>) {
  const { locale } = await params;
  const posts = blogPreviewOf(await getBlog(), locale);
  const bannerCopy = (await getTranslations({ locale, namespace: "shopBanner" })).raw("banners") as { href: string }[];
  const catalog = await getCatalog();
  const bannerHrefs = bannerCopy.map((banner) => canonicalCatalogHref(catalog, locale, banner.href));
  return (
    <>
      <JsonLd data={await siteLd(locale)} />
      <Navbar />
      <Hero />
      <ShopCategories />
      <ShopBanner hrefs={bannerHrefs} />
      <About />
      <Services />
      <Shop />
      <CtaBanner />
      <Portfolio />
      <Testimonials />
      <FAQ />
      <Quality />
      <Process />
      <BlogPreview posts={posts} />
      <Brands />
      <CTA />
      <PartnerLogos />
      <Footer />
    </>
  );
}
