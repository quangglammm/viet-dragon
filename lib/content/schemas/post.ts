import { z } from "zod";
import { DOCUMENT_SCHEMA, mediaKeySchema, nonblankText, perLocale, requireDefaultLocale, seoFields, slugSchema, uidSchema } from "./common";

// A blog post (docs/data-model.md §4 "Blog"). Slugs follow the product rule: the canonical one plus old URLs as aliases.

export const POST_STATUSES = ["published", "archived"] as const;
export const CONTENT_FORMAT_VALUES = ["plain", "markdown"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có dạng YYYY-MM-DD.");

export const postDocumentSchema = z
  .strictObject({
    schema: z.literal(DOCUMENT_SCHEMA),
    uid: uidSchema,
    slug: slugSchema,
    aliases: z.array(slugSchema),
    /** Post category key. */
    category: slugSchema,
    publishedOn: isoDate,
    readTimeMin: z.int().positive().nullable(),
    cover: mediaKeySchema.nullable(),
    ogImage: mediaKeySchema.nullable(),
    contentFormat: z.enum(CONTENT_FORMAT_VALUES),
    status: z.enum(POST_STATUSES),
    i18n: perLocale(
      z.strictObject({ title: nonblankText, excerpt: nonblankText.optional(), content: nonblankText, ...seoFields }),
    ),
  })
  .superRefine((post, ctx) => {
    requireDefaultLocale(post.i18n, ctx, []);
    if (post.aliases.includes(post.slug)) ctx.addIssue({ code: "custom", message: "Đường dẫn chính không thể đồng thời là bí danh.", path: ["aliases"] });
    if (new Set(post.aliases).size !== post.aliases.length) ctx.addIssue({ code: "custom", message: "Có bí danh bị trùng.", path: ["aliases"] });
  });

export type PostDocument = z.infer<typeof postDocumentSchema>;
