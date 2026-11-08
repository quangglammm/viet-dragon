import type { MediaRow } from "./api";

// The browser's side of an upload, as pure logic (the project's convention: a reducer's tests stand in for DOM tests). Two jobs:
//   * refuse a file BEFORE sending it when it can only fail — above all one over the size cap: the server answers 413 and closes the
//     connection while the browser is still sending, which `fetch` reports as a dead network, not as «too large»;
//   * keep the queue of files an editor dropped: one at a time, a failure never stops the rest, every file ends with its own result line.
// The server stays the judge of what a file really is (lib/media): the checks here use only the name, size and the type the browser claims.

export interface CandidateFile {
  name: string;
  size: number;
  /** The MIME type the browser guesses from the extension; empty when it does not know the format (AVIF in some browsers). */
  type: string;
}

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;
const ACCEPTED_TYPES: readonly string[] = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(",");
/** What the server takes until it has said (`MEDIA_MAX_IMAGE_MB`'s default): the list answer carries the real figure. */
export const DEFAULT_MAX_UPLOAD_BYTES = 10 * MEGABYTE;
const SUPPORTED = "JPG, PNG, WebP, AVIF hoặc GIF";

/** `12,3 MB`, `10 MB`, `850 KB`: sizes as Vietnamese readers write them (a whole number of megabytes has no decimal). */
export function formatBytes(bytes: number): string {
  if (bytes >= MEGABYTE) {
    const tenths = Math.round((bytes / MEGABYTE) * 10);
    return `${tenths % 10 === 0 ? tenths / 10 : (tenths / 10).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.max(1, Math.round(bytes / KILOBYTE))} KB`;
}

/** Why this file should not be sent, or null. */
export function checkFile(file: CandidateFile, maxBytes: number): string | null {
  const name = `«${file.name}»`;
  if (file.size === 0) return `${name} là tệp trống.`;
  if (file.size > maxBytes) return `${name} nặng ${formatBytes(file.size)}, vượt giới hạn ${formatBytes(maxBytes)}. Hãy thu nhỏ ảnh rồi tải lên lại.`;
  if (file.type === "image/svg+xml") return `${name} là ảnh SVG: không nhận vì có thể chứa mã chạy trên trang. Hãy dùng ${SUPPORTED}.`;
  if (file.type !== "" && !ACCEPTED_TYPES.includes(file.type)) return `${name} không phải ảnh được hỗ trợ. Hãy dùng ${SUPPORTED}.`;
  return null;
}

// ───────────── the queue ─────────────

export type UploadStatus = "waiting" | "uploading" | "done" | "failed";

export interface UploadEntry {
  id: number;
  name: string;
  size: number;
  status: UploadStatus;
  /** A finished upload: the library's row, and whether the same picture was already there. */
  item?: MediaRow;
  existing?: boolean;
  /** A failed one: what to tell the editor. */
  message?: string;
}

export interface UploadQueue {
  entries: readonly UploadEntry[];
}

export const emptyQueue: UploadQueue = { entries: [] };

export type UploadAction =
  /** The files get the ids `firstId`, `firstId + 1`…: the caller counts, because it keeps the `File` objects under those ids. */
  | { type: "added"; files: readonly CandidateFile[]; maxBytes: number; firstId: number }
  | { type: "started"; id: number }
  | { type: "succeeded"; id: number; item: MediaRow; existing: boolean }
  | { type: "failed"; id: number; message: string }
  /** Drops the finished lines (done and failed); what is still waiting or uploading stays. */
  | { type: "cleared" };

const update = (queue: UploadQueue, id: number, change: (entry: UploadEntry) => UploadEntry): UploadQueue => ({ entries: queue.entries.map((entry) => (entry.id === id ? change(entry) : entry)) });

export function uploadQueueReducer(queue: UploadQueue, action: UploadAction): UploadQueue {
  switch (action.type) {
    case "added": {
      // A file that can only fail is a finished line at once; it never reaches the server.
      const added = action.files.map((file, index): UploadEntry => {
        const refusal = checkFile(file, action.maxBytes);
        return { id: action.firstId + index, name: file.name, size: file.size, ...(refusal === null ? { status: "waiting" } : { status: "failed", message: refusal }) };
      });
      return { entries: [...queue.entries, ...added] };
    }
    case "started":
      return update(queue, action.id, (entry) => (entry.status === "waiting" ? { ...entry, status: "uploading" } : entry));
    case "succeeded":
      return update(queue, action.id, (entry) => (entry.status === "uploading" ? { ...entry, status: "done", item: action.item, existing: action.existing } : entry));
    case "failed":
      return update(queue, action.id, (entry) => (entry.status === "uploading" ? { ...entry, status: "failed", message: action.message } : entry));
    case "cleared":
      return { entries: queue.entries.filter((entry) => entry.status === "waiting" || entry.status === "uploading") };
  }
}

/** The file to send next: only when nothing is in flight (one at a time keeps the server's decoder load and the editor's bandwidth sane). */
export function nextToUpload(queue: UploadQueue): UploadEntry | undefined {
  return queue.entries.some((entry) => entry.status === "uploading") ? undefined : queue.entries.find((entry) => entry.status === "waiting");
}

export const isUploading = (queue: UploadQueue): boolean => queue.entries.some((entry) => entry.status === "waiting" || entry.status === "uploading");

/** «Đang tải 2/5…»: how far along the current batch is (finished lines count, so a clear starts the count again). */
export function progressOf(queue: UploadQueue): { finished: number; total: number } {
  return { finished: queue.entries.filter((entry) => entry.status === "done" || entry.status === "failed").length, total: queue.entries.length };
}
