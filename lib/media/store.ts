import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMediaEnv } from "@/lib/env";
import { isUploadKey } from "./formats";

// The uploads volume. A file's storage key (`uploads/2026/poster-1a2b3c4d.webp`) is its address inside it, with the first segment standing for
// the volume itself: `<UPLOADS_DIR>/2026/poster-1a2b3c4d.webp`. Nothing here is a general file API — only keys `uploadKey` could have written
// resolve to a path, and the path is checked against the volume once more, so a bug elsewhere cannot turn into a read or write outside it.

function locate(key: string): string {
  if (!isUploadKey(key)) throw new Error(`not the storage key of an upload: ${key}`);
  const root = path.resolve(getMediaEnv().UPLOADS_DIR);
  const full = path.resolve(root, ...key.split("/").slice(1));
  const relative = path.relative(root, full);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`outside the uploads volume: ${key}`);
  return full;
}

/** Writes the file whole or not at all: a temporary name in the same folder, then a rename, so a reader never sees half a picture. */
export async function writeUpload(key: string, bytes: Uint8Array): Promise<void> {
  const full = locate(key);
  await mkdir(path.dirname(full), { recursive: true });
  const temporary = `${full}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes, { flag: "wx" });
    await rename(temporary, full);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

/** The file's bytes, or null when it is not on the volume. */
export async function readUpload(key: string): Promise<Buffer | null> {
  try {
    return await readFile(locate(key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Removes the file; one that is already gone is not an error. */
export async function removeUpload(key: string): Promise<void> {
  await rm(locate(key), { force: true });
}
