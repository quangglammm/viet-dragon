import type { LocaleCode } from "../schemas";
import { publicPath } from "../../routes";
import { absoluteUrl } from "./seo";

// The structured data a page carries for search engines (schema.org, JSON-LD). Pure builders over what the page already shows; the
// `<script>` that carries them is components/seo/json-ld.tsx. Addresses are absolute: `origin` is the site's own (SITE_URL).

export type JsonLd = Record<string, unknown>;

export interface Crumb {
  name: string;
  /** Internal path of the page (the catalog's category page, for one). */
  path: string;
}

export const urlOf = (origin: string, locale: LocaleCode, internalPath: string): string => absoluteUrl(origin, publicPath(locale, internalPath));

export function breadcrumbOf(origin: string, locale: LocaleCode, crumbs: readonly Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: urlOf(origin, locale, crumb.path) })),
  };
}

export interface OrganizationInput {
  origin: string;
  locale: LocaleCode;
  name: string;
  /** Public path of the logo. */
  logo: string;
  telephone: string;
  email: string;
  /** Where the business serves (text: «TP. Hồ Chí Minh, Đồng Nai…»); the site publishes no street address. */
  areaServed: string;
}

export function organizationOf(input: OrganizationInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${input.origin}/#organization`,
    name: input.name,
    url: urlOf(input.origin, input.locale, "/"),
    logo: `${input.origin}${input.logo}`,
    telephone: input.telephone,
    email: input.email,
    areaServed: input.areaServed,
  };
}

export function websiteOf(input: { origin: string; locale: LocaleCode; name: string }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: urlOf(input.origin, input.locale, "/"),
    inLanguage: input.locale,
    publisher: { "@id": `${input.origin}/#organization` },
  };
}

export interface BlogPostingInput {
  origin: string;
  locale: LocaleCode;
  headline: string;
  description: string;
  /** Internal path of the post. */
  path: string;
  /** Public path of the cover, or null. */
  image: string | null;
  /** `YYYY-MM-DD`. */
  datePublished: string;
  publisher: { name: string; logo: string };
}

export function blogPostingOf(input: BlogPostingInput): JsonLd {
  const publisher = { "@type": "Organization", name: input.publisher.name, logo: { "@type": "ImageObject", url: `${input.origin}${input.publisher.logo}` } };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    mainEntityOfPage: urlOf(input.origin, input.locale, input.path),
    url: urlOf(input.origin, input.locale, input.path),
    datePublished: input.datePublished,
    inLanguage: input.locale,
    ...(input.image ? { image: `${input.origin}${input.image}` } : {}),
    author: publisher,
    publisher,
  };
}

/** The text of the `<script>`: JSON with every character that could end the tag or be misread in HTML written as an escape. */
export function serializeJsonLd(data: JsonLd | readonly JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
