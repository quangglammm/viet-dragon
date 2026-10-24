import type { Metadata } from "next";
import { LOCALES, type LocaleCode } from "../schemas";
import { publicPath } from "../../routes";
import type { Localized } from "./text";
import type { Seo } from "./types";

// What a page tells search engines and link previews: its title and description, its canonical URL and the same page in the other
// languages (`hreflang`), the Open Graph / Twitter card. Pure; the pages' `generateMetadata` call `pageMetadata`.

export interface Meta {
  title: string;
  description: string;
  /** Public path of the picture a link preview shows (`/images/…`), or null for the site's default. */
  image: string | null;
}

/** The page's own title and description unless the editor wrote an SEO text FOR THIS LANGUAGE — never another language's. */
export function seoMeta(locale: LocaleCode, seo: Seo, fallback: { title: string; description: string }, image: string | null): Meta {
  const own = (text: Localized): string | undefined => (text[locale]?.trim() ? text[locale] : undefined);
  return { title: own(seo.title) ?? fallback.title, description: own(seo.description) ?? fallback.description, image };
}

/**
 * The absolute address of a public path. The home page is the bare origin — the form Next writes for `canonical`, `hreflang` and
 * `og:url` (it joins `metadataBase` and `/` without the slash) — so the sitemap and the structured data say it the same way.
 */
export const absoluteUrl = (origin: string, path: string): string => (path === "/" ? origin : `${origin}${path}`);

/** Internal path of the same page in each language (slugs differ per language; see `alternatePaths` in urls.ts). */
export type LanguagePaths = Record<LocaleCode, string>;

/** A page whose address does not depend on the language's slugs (the home page, the product index…). */
export const samePath = (path: string): LanguagePaths => Object.fromEntries(LOCALES.map((locale) => [locale, path])) as LanguagePaths;

/** `canonical` is the page's own address; `languages` lists every language and `x-default` (the Vietnamese page). */
export function alternatesOf(locale: LocaleCode, paths: LanguagePaths): { canonical: string; languages: Record<string, string> } {
  return {
    canonical: publicPath(locale, paths[locale]),
    languages: { ...Object.fromEntries(LOCALES.map((language) => [language, publicPath(language, paths[language])])), "x-default": publicPath("vi", paths.vi) },
  };
}

const OG_LOCALE: Record<LocaleCode, string> = { vi: "vi_VN", en: "en_US", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR" };

export interface SiteSeo {
  siteName: string;
  /** Public path of the picture a preview shows when the page has none. */
  defaultImage: string | null;
}

export interface MetadataInput {
  locale: LocaleCode;
  meta: Meta;
  paths: LanguagePaths;
  site: SiteSeo;
  type?: "website" | "article";
  /** `YYYY-MM-DD`, for an article. */
  publishedTime?: string;
}

export function pageMetadata({ locale, meta, paths, site, type = "website", publishedTime }: MetadataInput): Metadata {
  const alternates = alternatesOf(locale, paths);
  const image = meta.image ?? site.defaultImage;
  const images = image ? [{ url: image }] : undefined;
  return {
    title: meta.title,
    description: meta.description,
    alternates,
    openGraph: {
      type,
      title: meta.title,
      description: meta.description,
      url: alternates.canonical,
      siteName: site.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((language) => language !== locale).map((language) => OG_LOCALE[language]),
      images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images },
  };
}
