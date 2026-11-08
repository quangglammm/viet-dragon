import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CONTACT_EMAIL, PHONE_NUMBER } from "@/lib/contact";
import { getSiteEnv } from "@/lib/env";
import type { LocaleCode } from "../schemas";
import { blogPostingOf, breadcrumbOf, organizationOf, websiteOf, type BlogPostingInput, type Crumb, type JsonLd } from "./jsonld";
import type { ProductContext } from "./pages";
import { pageMetadata, type MetadataInput, type SiteSeo } from "./seo";

// The server side of seo.ts / jsonld.ts: where the site's own facts come from (SITE_URL, the `seo` and `contact` UI copy, lib/contact.ts).

const LOGO = "/logo-icon.webp";

/** The site's address: an origin, validated and normalized by `getSiteEnv` (no path, no trailing slash). */
const siteOrigin = (): string => getSiteEnv().SITE_URL;

async function siteSeoOf(locale: LocaleCode): Promise<SiteSeo> {
  const t = await getTranslations({ locale, namespace: "seo" });
  return { siteName: t("siteName"), defaultImage: t("defaultOgImage") || null };
}

/** A page's `generateMetadata` result: title, description, canonical, hreflang, Open Graph, Twitter. */
export async function metadataFor(input: Omit<MetadataInput, "site">): Promise<Metadata> {
  return pageMetadata({ ...input, site: await siteSeoOf(input.locale) });
}

/** The trail of a product page, a shape or a material of it: Home / Products / Category / Product [/ page]. */
export async function productCrumbs(locale: LocaleCode, context: ProductContext, last?: Crumb): Promise<Crumb[]> {
  const t = await getTranslations({ locale, namespace: "productDetailPage" });
  return [
    { name: t("breadcrumbHome"), path: "/" },
    { name: t("breadcrumbProducts"), path: "/products" },
    { name: context.category.label, path: context.category.href },
    { name: context.product.label, path: context.product.href },
    ...(last ? [last] : []),
  ];
}

export const breadcrumbLd = (locale: LocaleCode, crumbs: readonly Crumb[]): JsonLd => breadcrumbOf(siteOrigin(), locale, crumbs);

/** The business and the website, for the home page. */
export async function siteLd(locale: LocaleCode): Promise<JsonLd[]> {
  const [seo, contact] = await Promise.all([siteSeoOf(locale), getTranslations({ locale, namespace: "contact" })]);
  const origin = siteOrigin();
  return [
    organizationOf({ origin, locale, name: seo.siteName, logo: LOGO, telephone: `+84${PHONE_NUMBER.slice(1)}`, email: CONTACT_EMAIL, areaServed: contact("address") }),
    websiteOf({ origin, locale, name: seo.siteName }),
  ];
}

export async function blogPostingLd(locale: LocaleCode, input: Omit<BlogPostingInput, "origin" | "locale" | "publisher">): Promise<JsonLd> {
  const { siteName } = await siteSeoOf(locale);
  return blogPostingOf({ ...input, origin: siteOrigin(), locale, publisher: { name: siteName, logo: LOGO } });
}
