import * as schema from "@/lib/db/schema";
import type { MediaRegistry, SeedContext } from "../context";
import { LOCALES, localizedText, type Locale } from "../localized";
import { bump, isBlankText, majority, orNull } from "../util";

// Blog categories and posts. Categories are a small vocabulary (key + a label per language); a post's category
// label is repeated on every post in the data, so the seed takes the most frequent spelling.

export async function seedBlog(ctx: SeedContext, media: MediaRegistry): Promise<void> {
  const { tx, src } = ctx;
  const labels = new Map<string, Record<Locale, Map<string, number>>>();
  for (const post of src.posts) {
    const perLocale =
      labels.get(post.category) ?? labels.set(post.category, Object.fromEntries(LOCALES.map((l) => [l, new Map<string, number>()])) as Record<Locale, Map<string, number>>).get(post.category)!;
    for (const locale of LOCALES) {
      const label = localizedText(post, "category", "suffixed", locale);
      if (!isBlankText(label)) bump(perLocale[locale], label as string);
    }
  }
  for (const [key, perLocale] of labels) {
    await tx.insert(schema.postCategory).values({ key });
    await tx.insert(schema.postCategoryI18n).values(LOCALES.filter((l) => perLocale[l].size > 0).map((locale) => ({ categoryKey: key, locale, label: majority(perLocale[locale]).value })));
  }

  for (const post of src.posts) {
    const [row] = await tx
      .insert(schema.post)
      .values({ categoryKey: post.category, publishedOn: post.date, readTimeMin: post.readTime, coverMediaId: media.idOf(post.coverImage) })
      .returning({ id: schema.post.id });
    await tx.insert(schema.postSlug).values({ slug: post.slug, postId: row.id, isCanonical: true });
    const translations = LOCALES.flatMap((locale) => {
      const title = localizedText(post, "title", "post", locale);
      if (isBlankText(title)) return [];
      return [{ postId: row.id, locale, title: title as string, excerpt: orNull(localizedText(post, "excerpt", "post", locale)), content: localizedText(post, "content", "post", locale) ?? "" }];
    });
    await tx.insert(schema.postI18n).values(translations);
  }
}
