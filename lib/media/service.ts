import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { Conflict, Invalid, NotFound } from "@/lib/content/errors";
import { databaseErrorOf } from "@/lib/content/humanize";
import { readMedia, type MediaItem } from "@/lib/content/media-library";
import { usedBy } from "@/lib/content/used-by";
import { media } from "@/lib/db/schema";
import type { Db, DbExecutor } from "@/lib/db/types";
import { getLogger } from "@/lib/logger";
import { isUploadKey, rejectionReason, sniffImage, uploadKey } from "./formats";
import { processImage } from "./process";
import { removeUpload, writeUpload } from "./store";

// Upload and delete, the two things that change the library. The HTTP layer (app/api/admin/content/media) only authenticates and reads the body.

const log = getLogger("media");
const FOREIGN_KEY_VIOLATION = "23503";

export interface UploadInput {
  /** The bytes the browser sent, whatever they are. */
  bytes: Uint8Array;
  /** The name on the user's disk: only ever used to make the stored name readable. */
  name: string;
  /** Account id of the uploader. */
  author: string | null;
  /** Injectable for tests. */
  now?: Date;
}

export interface UploadResult {
  item: MediaItem;
  /** The same picture was already in the library: nothing was stored, this is the existing file. */
  existing: boolean;
}

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

async function uploadedWith(db: DbExecutor, hash: string): Promise<MediaItem | null> {
  const [row] = await db.select({ key: media.storageKey }).from(media).where(eq(media.sha256, hash)).limit(1);
  return row ? readMedia(db, row.key) : null;
}

export interface UploadRecord {
  mime: string;
  sha256: string;
}

/** What the serving route needs to answer for a key: only an upload with a known hash, never a built-in file (those are served from `public/`). */
export async function readUploadRecord(db: Db, key: string): Promise<UploadRecord | null> {
  const [row] = await db
    .select({ mime: media.mime, sha256: media.sha256 })
    .from(media)
    .where(and(eq(media.storageKey, key), eq(media.source, "upload")));
  return row?.sha256 ? { mime: row.mime, sha256: row.sha256 } : null;
}

/**
 * Checks the bytes, stores a re-encoded copy on the volume and registers it. The order matters: the file is written before the row, so a row
 * never points at nothing; a failure after the write is followed by removing the file it was for.
 *
 * The same picture uploaded twice at the same moment — under different names, so under different keys — must still become ONE file and one
 * row: the duplicate check and the insert run in a transaction that first takes a lock named after the picture's hash, so the second request
 * waits for the first and then finds its row.
 */
export async function uploadImage(db: Db, { bytes, name, author, now = new Date() }: UploadInput): Promise<UploadResult> {
  if (!sniffImage(bytes)) throw new Invalid([{ path: "file", message: rejectionReason(bytes) }]);
  const processed = await processImage(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  const hash = sha256(processed.bytes);
  const key = uploadKey({ year: now.getUTCFullYear(), name, hash });

  let written = false;
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${hash}, 0))`);
      const already = await uploadedWith(tx, hash);
      if (already) return { item: already, existing: true };
      // The 8 hex characters of the hash are part of the key; another picture under the same name that shares them is a 1-in-4-billion event, answered plainly.
      if (await readMedia(tx, key)) throw new Invalid([{ path: "file", message: "Đã có một ảnh khác trùng tên tệp này. Hãy đổi tên tệp rồi tải lên lại." }]);

      await writeUpload(key, processed.bytes);
      written = true;
      await tx.insert(media).values({
        source: "upload",
        backend: "local",
        storageKey: key,
        kind: "image",
        mime: processed.mime,
        width: processed.width,
        height: processed.height,
        bytes: processed.bytes.length,
        sha256: hash,
        createdBy: author,
      });
      const item = await readMedia(tx, key);
      if (!item) throw new Error(`the row of ${key} is missing right after it was inserted`);
      return { item, existing: false };
    });
  } catch (error) {
    if (written) await removeUpload(key).catch((cause: unknown) => log.error({ err: cause, key }, "could not remove the file of a failed upload"));
    throw error;
  }
}

/**
 * Removes an upload from the library. Only an upload (the site's own files are part of the build), and only while nothing uses it: the live
 * rows that point at it are protected by foreign keys, the open drafts that name it are counted here — they would otherwise be left pointing
 * at a file that is gone. The file is removed after the row; one that cannot be is logged and left (it is never served without its row).
 */
export async function deleteUpload(db: Db, key: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx.select({ id: media.id, source: media.source }).from(media).where(eq(media.storageKey, key)).for("update");
    if (!row) throw new NotFound("Không tìm thấy tệp này trong thư viện.");
    // Not only the label: a row that carries one (the seed once labelled public/uploads/* so) must also have a key this module could have written.
    if (row.source !== "upload" || !isUploadKey(key)) throw new Conflict("READ_ONLY", "Đây là tệp có sẵn của website, không xóa được từ thư viện.");

    const { live, drafts } = await usedBy(tx, "media", key);
    if (live + drafts > 0) {
      throw new Conflict("IN_USE", `Ảnh này đang được dùng (${live} mục đang hiển thị, ${drafts} bản nháp). Hãy thay ảnh ở các mục đó trước.`);
    }
    try {
      await tx.delete(media).where(eq(media.id, row.id));
    } catch (error) {
      // A publish that started after the count above and uses the file: the foreign key is the last line of defence.
      if (databaseErrorOf(error)?.code === FOREIGN_KEY_VIOLATION) throw new Conflict("IN_USE", "Ảnh này vừa được một mục khác dùng nên chưa xóa được.");
      throw error;
    }
  });
  await removeUpload(key).catch((cause: unknown) => log.error({ err: cause, key }, "removed the row of an upload but not its file"));
}
