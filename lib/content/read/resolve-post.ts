import { notFound } from "next/navigation";
import { permanentRedirect } from "@/i18n/navigation";
import type { LocaleCode } from "../schemas";
import { getBlog } from "./load";
import { resolvePostUrl, type Blog, type PostView } from "./posts";

// The post page's first step, like resolve-page.ts for the catalog: a canonical URL renders, an old one (a former slug, another
// language's) is answered with a permanent redirect to the canonical, anything else — an archived post included — is a 404.
// The route is dynamic (no `generateStaticParams`) for the reason given in resolve-page.ts.

export interface FoundPost {
  blog: Blog;
  post: PostView;
}

/** For `generateMetadata`: the post the URL names, or null when the page itself will redirect or answer 404. */
export async function peekPost(locale: LocaleCode, slug: string): Promise<FoundPost | null> {
  const blog = await getBlog();
  const resolved = resolvePostUrl(blog, locale, slug);
  return resolved.status === "ok" ? { blog, post: resolved.post } : null;
}

export async function resolvePost(locale: LocaleCode, slug: string): Promise<FoundPost> {
  const blog = await getBlog();
  const resolved = resolvePostUrl(blog, locale, slug);
  if (resolved.status === "notFound") notFound();
  if (resolved.status === "redirect") return permanentRedirect({ href: resolved.to, locale });
  return { blog, post: resolved.post };
}
