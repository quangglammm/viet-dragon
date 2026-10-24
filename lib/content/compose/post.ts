import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import { DOCUMENT_SCHEMA, type PostDocument } from "../schemas";
import { byText, coverMedia, i18nMap, ogMedia, optional, seoOf, type Composed } from "./shared";

export async function composePost(x: DbExecutor, uid: string): Promise<Composed<PostDocument> | null> {
  const [head] = await x
    .select({
      id: schema.post.id,
      category: schema.post.categoryKey,
      publishedOn: schema.post.publishedOn,
      readTimeMin: schema.post.readTimeMin,
      contentFormat: schema.post.contentFormat,
      status: schema.post.status,
      version: schema.post.version,
      cover: coverMedia.storageKey,
      ogImage: ogMedia.storageKey,
    })
    .from(schema.post)
    .leftJoin(coverMedia, eq(coverMedia.id, schema.post.coverMediaId))
    .leftJoin(ogMedia, eq(ogMedia.id, schema.post.ogMediaId))
    .where(eq(schema.post.uid, uid));
  if (!head) return null;
  const slugs = await x.select().from(schema.postSlug).where(eq(schema.postSlug.postId, head.id));
  const texts = await x.select().from(schema.postI18n).where(eq(schema.postI18n.postId, head.id));
  const document: PostDocument = {
    schema: DOCUMENT_SCHEMA,
    uid,
    slug: slugs.find((s) => s.isCanonical)?.slug ?? "",
    aliases: slugs.filter((s) => !s.isCanonical).map((s) => s.slug).sort(byText),
    category: head.category,
    publishedOn: head.publishedOn,
    readTimeMin: head.readTimeMin,
    cover: head.cover,
    ogImage: head.ogImage,
    contentFormat: head.contentFormat,
    status: head.status,
    i18n: i18nMap(texts, (t) => ({ title: t.title, ...optional("excerpt", t.excerpt), content: t.content, ...seoOf(t) })),
  };
  return { document, version: head.version };
}
