import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import type { LocaleCode, PostDocument } from "../schemas";
import { loadDocumentMedia } from "./lookups";
import { planSegments } from "./product-slugs";
import { localeEntries, touched, versionAfter } from "./shared";
import type { Applier, ApplyContext } from "./types";

// A blog post: identified by its uid; the slug in each language is an ordinary attribute and every old slug stays valid.

/** Canonical slug + named aliases + every slug held now, per language (one target for `planSegments`). */
async function writeSlugs(tx: Tx, postId: number, slugs: PostDocument["slugs"], existed: boolean): Promise<void> {
  const held: Partial<Record<LocaleCode, string[]>> = {};
  if (existed) {
    for (const row of await tx.select().from(schema.postSlug).where(eq(schema.postSlug.postId, postId))) (held[row.locale as LocaleCode] ??= []).push(row.slug);
  }
  await tx.delete(schema.postSlug).where(eq(schema.postSlug.postId, postId));
  const rows = planSegments([{ key: "post", slugs, held }]);
  await tx.insert(schema.postSlug).values(rows.map((row) => ({ postId, locale: row.locale, slug: row.slug, isCanonical: row.isCanonical })));
}

async function applyPost(tx: Tx, doc: PostDocument, context: ApplyContext): Promise<number> {
  const version = versionAfter(context);
  const media = await loadDocumentMedia(tx, "post", doc);
  const columns = {
    categoryKey: doc.category,
    publishedOn: doc.publishedOn,
    readTimeMin: doc.readTimeMin,
    coverMediaId: media.idOrNull(doc.cover),
    ogMediaId: media.idOrNull(doc.ogImage),
    contentFormat: doc.contentFormat,
    status: doc.status,
    version,
  };
  const existed = context.baseVersion !== null;
  let postId: number;
  if (existed) {
    [{ id: postId }] = await tx.update(schema.post).set({ ...columns, ...touched(context.author) }).where(eq(schema.post.uid, doc.uid)).returning({ id: schema.post.id });
  } else {
    [{ id: postId }] = await tx.insert(schema.post).values({ uid: doc.uid, ...columns, updatedBy: context.author }).returning({ id: schema.post.id });
  }

  await writeSlugs(tx, postId, doc.slugs, existed);
  await tx.delete(schema.postI18n).where(eq(schema.postI18n.postId, postId));
  await tx.insert(schema.postI18n).values(
    localeEntries(doc.i18n).map(([locale, t]) => ({
      postId,
      locale,
      title: t.title,
      excerpt: t.excerpt ?? null,
      content: t.content,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
    })),
  );
  return version;
}

export const postApplier: Applier<PostDocument> = {
  async lock(tx, uid) {
    const [row] = await tx.select({ version: schema.post.version }).from(schema.post).where(eq(schema.post.uid, uid)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyPost,
};
