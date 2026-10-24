import { and, asc, eq, ilike, like, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";

// The read side of the media table for the editors' image picker. Uploads are Phase 5; until then the table holds the site's own
// files, whose public URL is simply `/<storage_key>`.

import { MAX_MEDIA_PAGE_SIZE, MEDIA_PAGE_SIZE } from "./media-limits";

export { MAX_MEDIA_PAGE_SIZE, MEDIA_PAGE_SIZE };

export interface MediaItem {
  key: string;
  kind: "image" | "video";
  mime: string;
  width: number | null;
  height: number | null;
  bytes: number;
  /** The Vietnamese description, when the file has one. */
  alt: string | null;
}

export interface MediaQuery {
  /** Part of the file path, case-insensitive. */
  q?: string;
  kind?: "image" | "video";
  /** A folder of the library, e.g. `images/hero`: files directly or deeply under it. */
  folder?: string;
  limit?: number;
  offset?: number;
}

export interface MediaPage {
  items: MediaItem[];
  hasMore: boolean;
}

/** `%` and `_` are wildcards in LIKE; a path is searched for literally. */
const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (char) => `\\${char}`);

export async function listMedia(x: DbExecutor, query: MediaQuery = {}): Promise<MediaPage> {
  const limit = Math.min(Math.max(query.limit ?? MEDIA_PAGE_SIZE, 1), MAX_MEDIA_PAGE_SIZE);
  const conditions = [
    query.q ? ilike(schema.media.storageKey, `%${escapeLike(query.q)}%`) : undefined,
    query.kind ? eq(schema.media.kind, query.kind) : undefined,
    query.folder ? like(schema.media.storageKey, `${escapeLike(query.folder.replace(/\/+$/, ""))}/%`) : undefined,
  ];
  const rows = await x
    .select({
      key: schema.media.storageKey,
      kind: schema.media.kind,
      mime: schema.media.mime,
      width: schema.media.width,
      height: schema.media.height,
      bytes: schema.media.bytes,
      alt: schema.mediaI18n.alt,
    })
    .from(schema.media)
    .leftJoin(schema.mediaI18n, and(eq(schema.mediaI18n.mediaId, schema.media.id), eq(schema.mediaI18n.locale, "vi")))
    .where(and(...conditions))
    .orderBy(asc(schema.media.storageKey))
    .limit(limit + 1)
    .offset(query.offset ?? 0);
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
}

/** The two-level folders (`images/hero`) with how many files each holds, for the picker's filter. */
export async function listMediaFolders(x: DbExecutor): Promise<{ folder: string; count: number }[]> {
  const folder = sql<string>`split_part(${schema.media.storageKey}, '/', 1) || '/' || split_part(${schema.media.storageKey}, '/', 2)`;
  const rows = await x
    .select({ folder, count: sql<number>`count(*)::int` })
    .from(schema.media)
    .where(like(schema.media.storageKey, "%/%/%"))
    .groupBy(folder)
    .orderBy(asc(folder));
  return rows;
}
