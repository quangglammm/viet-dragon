import { and, asc, eq, ilike, like, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";

// The read side of the media table: the editors' image picker and the library page. A file is known by its storage key and shown at
// `/<storage_key>`: the site's own files (`source = "static"`) are served from `public/`, uploads (`source = "upload"`, see lib/media) by
// the route `app/uploads/[...key]`.

import { MAX_MEDIA_PAGE_SIZE, MEDIA_PAGE_SIZE } from "./media-limits";

export { MAX_MEDIA_PAGE_SIZE, MEDIA_PAGE_SIZE };

export interface MediaItem {
  key: string;
  /** `static`: a built-in file of the site, read-only here. `upload`: added through the admin, deletable while nothing uses it. */
  source: "static" | "upload";
  kind: "image" | "video";
  mime: string;
  width: number | null;
  height: number | null;
  bytes: number;
  /** The Vietnamese description, when the file has one. */
  alt: string | null;
  createdAt: string;
}

export interface MediaQuery {
  /** Part of the file path, case-insensitive. */
  q?: string;
  kind?: "image" | "video";
  source?: MediaItem["source"];
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

const itemColumns = {
  key: schema.media.storageKey,
  source: schema.media.source,
  kind: schema.media.kind,
  mime: schema.media.mime,
  width: schema.media.width,
  height: schema.media.height,
  bytes: schema.media.bytes,
  alt: schema.mediaI18n.alt,
  createdAt: schema.media.createdAt,
};

/** A row as the query returns it: the same as the item, with the date still a Date. */
type ItemRow = Omit<MediaItem, "createdAt"> & { createdAt: Date };

const toItem = (row: ItemRow): MediaItem => ({ ...row, createdAt: row.createdAt.toISOString() });

/** One file of the library by its key, or null. */
export async function readMedia(x: DbExecutor, key: string): Promise<MediaItem | null> {
  const [row] = await x
    .select(itemColumns)
    .from(schema.media)
    .leftJoin(schema.mediaI18n, and(eq(schema.mediaI18n.mediaId, schema.media.id), eq(schema.mediaI18n.locale, "vi")))
    .where(eq(schema.media.storageKey, key));
  return row ? toItem(row) : null;
}

export async function listMedia(x: DbExecutor, query: MediaQuery = {}): Promise<MediaPage> {
  const limit = Math.min(Math.max(query.limit ?? MEDIA_PAGE_SIZE, 1), MAX_MEDIA_PAGE_SIZE);
  const conditions = [
    query.q ? ilike(schema.media.storageKey, `%${escapeLike(query.q)}%`) : undefined,
    query.kind ? eq(schema.media.kind, query.kind) : undefined,
    query.source ? eq(schema.media.source, query.source) : undefined,
    query.folder ? like(schema.media.storageKey, `${escapeLike(query.folder.replace(/\/+$/, ""))}/%`) : undefined,
  ];
  const rows = await x
    .select(itemColumns)
    .from(schema.media)
    .leftJoin(schema.mediaI18n, and(eq(schema.mediaI18n.mediaId, schema.media.id), eq(schema.mediaI18n.locale, "vi")))
    .where(and(...conditions))
    .orderBy(asc(schema.media.storageKey))
    .limit(limit + 1)
    .offset(query.offset ?? 0);
  return { items: rows.slice(0, limit).map(toItem), hasMore: rows.length > limit };
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
