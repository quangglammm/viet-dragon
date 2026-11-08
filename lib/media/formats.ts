// What an upload may be and where it lives. Pure: no file system, no database, so the rules are tested to the byte.
//
// An upload is judged by its BYTES, never by the name or the MIME type the browser claims: the sniffing here is the cheap first gate (it names
// what was sent in words an editor understands), and sharp's decoder (process.ts) is the real one. Whatever passes is re-encoded, so not a single
// byte of the original reaches the disk.

export const IMAGE_FORMATS = ["jpeg", "png", "gif", "webp", "avif"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/** The only format that is stored: every accepted image is re-encoded to it. */
export const UPLOAD_EXTENSION = "webp";
export const UPLOAD_MIME = "image/webp";
/** The first segment of every uploaded file's storage key — and of its URL. */
export const UPLOAD_PREFIX = "uploads";

const startsWith = (bytes: Uint8Array, signature: readonly number[], at = 0): boolean => signature.every((byte, index) => bytes[at + index] === byte);
const ascii = (bytes: Uint8Array, at: number, text: string): boolean => startsWith(bytes, [...text].map((char) => char.charCodeAt(0)), at);

/** The compatible brands of an ISO-BMFF `ftyp` box: the major brand and the list that follows it. */
function brandsOf(bytes: Uint8Array): string[] {
  if (bytes.length < 16 || !ascii(bytes, 4, "ftyp")) return [];
  const size = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  const end = Math.min(size, bytes.length);
  const brands = [String.fromCharCode(...bytes.slice(8, 12))];
  for (let at = 16; at + 4 <= end; at += 4) brands.push(String.fromCharCode(...bytes.slice(at, at + 4)));
  return brands;
}

/** The image format the first bytes say this is, or null. */
export function sniffImage(bytes: Uint8Array): ImageFormat | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (ascii(bytes, 0, "GIF87a") || ascii(bytes, 0, "GIF89a")) return "gif";
  if (ascii(bytes, 0, "RIFF") && ascii(bytes, 8, "WEBP")) return "webp";
  // HEIC and other ISO-BMFF pictures share the container: only a file that says «avif» is one.
  if (brandsOf(bytes).some((brand) => brand === "avif" || brand === "avis")) return "avif";
  return null;
}

const SUPPORTED = "JPG, PNG, WebP, AVIF hoặc GIF";

/** Why the bytes are not an image we take, in words for the editor. Named only for the kinds people actually try. */
export function rejectionReason(bytes: Uint8Array): string {
  if (bytes.length === 0) return "Tệp trống.";
  // UTF-8 decoding also drops a byte-order mark, which SVG files exported by some editors begin with.
  const head = new TextDecoder().decode(bytes.slice(0, 256)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return `Không nhận ảnh SVG (có thể chứa mã chạy trên trang). Hãy dùng ${SUPPORTED}.`;
  if (head.startsWith("<")) return `Đây là tệp HTML/XML, không phải ảnh. Hãy dùng ${SUPPORTED}.`;
  if (startsWith(bytes, [0x4d, 0x5a])) return `Đây là chương trình (.exe), không phải ảnh. Hãy dùng ${SUPPORTED}.`;
  if (ascii(bytes, 0, "%PDF")) return `Đây là tệp PDF, không phải ảnh. Hãy dùng ${SUPPORTED}.`;
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) return `Đây là tệp nén (zip), không phải ảnh. Hãy dùng ${SUPPORTED}.`;
  if (brandsOf(bytes).length > 0) return `Định dạng ảnh/video này chưa được hỗ trợ (HEIC, MP4…). Hãy dùng ${SUPPORTED}.`;
  return `Tệp không phải ảnh được hỗ trợ. Hãy dùng ${SUPPORTED}.`;
}

// ───────────── names and keys ─────────────

const MAX_SLUG_LENGTH = 40;
const FALLBACK_SLUG = "anh";
const HASH_LENGTH = 8;

/** `Poster Tết 2026 (bản cuối).JPG` → `poster-tet-2026-ban-cuoi`: the readable part of the stored name. */
export function slugOfName(originalName: string): string {
  const base = originalName.replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "");
  const plain = base
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cut = plain.length > MAX_SLUG_LENGTH ? plain.slice(0, MAX_SLUG_LENGTH).replace(/-[^-]*$/, "") || plain.slice(0, MAX_SLUG_LENGTH) : plain;
  return cut.replace(/-+$/, "") || FALLBACK_SLUG;
}

/** `uploads/2026/poster-tet-2026-1a2b3c4d.webp`: the key a file is known by in documents, in the database and in its URL. */
export function uploadKey({ year, name, hash }: { year: number; name: string; hash: string }): string {
  return `${UPLOAD_PREFIX}/${year}/${slugOfName(name)}-${hash.slice(0, HASH_LENGTH)}.${UPLOAD_EXTENSION}`;
}

const YEAR_SEGMENT = /^\d{4}$/;
// Exactly what `uploadKey` can produce, so nothing else — no dot-segment, no separator, no upper case — can ever name a file.
const FILE_SEGMENT = new RegExp(`^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{${HASH_LENGTH}}\\.${UPLOAD_EXTENSION}$`);

/** The storage key the URL segments after `/` name, or null when they could not be one of ours. The traversal guard of the serving route. */
export function parseUploadPath(segments: readonly string[]): string | null {
  if (segments.length !== 3 || segments[0] !== UPLOAD_PREFIX) return null;
  const [, year, file] = segments;
  return YEAR_SEGMENT.test(year) && FILE_SEGMENT.test(file) ? segments.join("/") : null;
}

export const isUploadKey = (key: string): boolean => parseUploadPath(key.split("/")) === key;
