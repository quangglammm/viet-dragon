import type { LocaleCode, PostCategoryDocument, PostDocument } from "../schemas";
import { publicPath } from "./catalog";
import { parseContent, type Block, type ContentFormat } from "./markdown";
import { seoMeta, type Meta } from "./seo";
import { localize, pickText, type Localized } from "./text";
import type { Seo, Slugs } from "./types";

// Documents → the public site's view of the blog, and the language-resolved models its pages draw. Pure, like catalog.ts: the same
// functions run in the tests (on documents composed from a seeded database) and in the cached loader.

export const BLOG_SEGMENT = "blog";

export interface PostView {
  uid: string;
  slugs: Slugs;
  /** Post category key. */
  category: string;
  /** `YYYY-MM-DD`. */
  publishedOn: string;
  readTimeMin: number | null;
  cover: string | null;
  ogImage: string | null;
  contentFormat: ContentFormat;
  title: Localized;
  excerpt: Localized;
  content: Localized;
  seo: Seo;
}

export interface Blog {
  /** Published posts, newest first (ties: the Vietnamese slug). */
  posts: PostView[];
  /** Post category key → its name per language. */
  categories: Record<string, Localized>;
}

export interface BlogInput {
  posts: readonly PostDocument[];
  categories: readonly PostCategoryDocument[];
}

function postView(post: PostDocument): PostView {
  return {
    uid: post.uid,
    slugs: post.slugs,
    category: post.category,
    publishedOn: post.publishedOn,
    readTimeMin: post.readTimeMin,
    cover: publicPath(post.cover),
    ogImage: publicPath(post.ogImage),
    contentFormat: post.contentFormat,
    title: localize(post.i18n, (row) => row.title),
    excerpt: localize(post.i18n, (row) => row.excerpt),
    content: localize(post.i18n, (row) => row.content),
    seo: { title: localize(post.i18n, (row) => row.seoTitle), description: localize(post.i18n, (row) => row.seoDescription) },
  };
}

export function buildBlog(input: BlogInput): Blog {
  return {
    posts: input.posts
      .filter((post) => post.status === "published")
      .map(postView)
      .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slugs.vi.slug.localeCompare(b.slugs.vi.slug)),
    categories: Object.fromEntries(input.categories.map((category) => [category.key, localize(category.i18n, (row) => row.label)])),
  };
}

// ───────────── URLs ─────────────

export const postPath = (locale: LocaleCode, post: Pick<PostView, "slugs">): string => `/${BLOG_SEGMENT}/${post.slugs[locale].slug}`;

export type ResolvedPost = { status: "ok"; post: PostView } | { status: "redirect"; to: string } | { status: "notFound" };

/**
 * What `/blog/<slug>` names in a language. The page's own language first (its slug, then its old ones), then any language's (a link
 * written for another language, or the one slug every language shared before each had its own); whatever was found, a request that is
 * not exactly the canonical URL of the page's language is answered with a redirect to it. An archived post is not in the blog: 404.
 */
export function resolvePostUrl(blog: Blog, locale: LocaleCode, slug: string): ResolvedPost {
  const claims = (language: LocaleCode, post: PostView): string[] => [post.slugs[language].slug, ...post.slugs[language].aliases];
  const own = blog.posts.find((post) => claims(locale, post).includes(slug));
  const any = own ?? blog.posts.find((post) => (Object.keys(post.slugs) as LocaleCode[]).some((language) => claims(language, post).includes(slug)));
  if (!any) return { status: "notFound" };
  const canonical = postPath(locale, any);
  return canonical === `/${BLOG_SEGMENT}/${slug}` ? { status: "ok", post: any } : { status: "redirect", to: canonical };
}

// ───────────── dates ─────────────

const DATE_LOCALE: Record<LocaleCode, string> = { vi: "vi-VN", en: "en-US", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" };

/** `2026-06-10` as the language writes dates. UTC, so the day never depends on the server's time zone. */
export function formatPostDate(iso: string, locale: LocaleCode, month: "2-digit" | "long" = "2-digit"): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE[locale], { day: "2-digit", month, year: "numeric", timeZone: "UTC" });
}

// ───────────── what the pages draw ─────────────

export interface PostCard {
  uid: string;
  href: string;
  title: string;
  excerpt: string;
  category: { key: string; label: string };
  readTimeMin: number | null;
  /** `YYYY-MM-DD`, and the date as the page's language writes it (`10/06/2026`). */
  publishedOn: string;
  date: string;
  cover: string | null;
}

function cardOf(blog: Blog, locale: LocaleCode, post: PostView): PostCard {
  return {
    uid: post.uid,
    href: postPath(locale, post),
    title: pickText(locale, post.title),
    excerpt: pickText(locale, post.excerpt),
    category: { key: post.category, label: pickText(locale, blog.categories[post.category]) },
    readTimeMin: post.readTimeMin,
    publishedOn: post.publishedOn,
    date: formatPostDate(post.publishedOn, locale),
    cover: post.cover,
  };
}

export interface BlogIndexModel {
  /** The newest post; null when there is none. */
  featured: PostCard | null;
  rest: PostCard[];
}

export function blogIndexOf(blog: Blog, locale: LocaleCode): BlogIndexModel {
  const [featured, ...rest] = blog.posts.map((post) => cardOf(blog, locale, post));
  return { featured: featured ?? null, rest };
}

/** The newest posts for the home page. */
export function blogPreviewOf(blog: Blog, locale: LocaleCode, count = 3): PostCard[] {
  return blog.posts.slice(0, count).map((post) => cardOf(blog, locale, post));
}

export interface PostPageModel {
  meta: Meta;
  post: PostCard;
  /** The date written out in full (`June 10, 2026`). */
  dateLong: string;
  blocks: Block[];
  /** The post before it in the list (the newer one) and after it (the older). */
  prev: { label: string; href: string } | null;
  next: { label: string; href: string } | null;
}

export function postPageOf(blog: Blog, locale: LocaleCode, post: PostView): PostPageModel {
  const at = blog.posts.findIndex((candidate) => candidate.uid === post.uid);
  const link = (other: PostView | undefined) => (other ? { label: pickText(locale, other.title), href: postPath(locale, other) } : null);
  const card = cardOf(blog, locale, post);
  return {
    meta: seoMeta(locale, post.seo, { title: `${card.title} | Viet Dragon Blog`, description: card.excerpt }, post.ogImage ?? post.cover),
    post: card,
    dateLong: formatPostDate(post.publishedOn, locale, "long"),
    blocks: parseContent(post.contentFormat, pickText(locale, post.content)),
    prev: at > 0 ? link(blog.posts[at - 1]) : null,
    next: at >= 0 ? link(blog.posts[at + 1]) : null,
  };
}
