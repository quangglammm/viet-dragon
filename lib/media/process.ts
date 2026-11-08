import sharp from "sharp";
import { Invalid } from "@/lib/content/errors";
import { UPLOAD_MIME } from "./formats";

// The one place an uploaded image becomes a file we are willing to store. The original is decoded (so a file that merely LOOKS like an image —
// a polyglot, a truncated or malicious stream — fails here) and a new image is encoded from the pixels: nothing of the original, appended
// payloads and metadata included, survives. EXIF (GPS, camera, owner) is not carried over, the orientation is applied instead, and the size is
// capped. Colours end up in sRGB without being asked: sharp converts to it whenever the metadata is not kept (print JPEGs are often CMYK or
// carry a wide-gamut profile), which `process.test.ts` pins for CMYK.

/** The longest side of a stored image: enough for a full-width banner on a large screen; the site's own optimizer makes the smaller sizes. */
export const MAX_EDGE = 3000;
/** A decoder allocates width × height × channels: refuse the pixel bombs a small file can describe. */
export const MAX_INPUT_PIXELS = 80_000_000;
// sharp's advice for untrusted input: stop at the first sign of trouble (a truncated or damaged stream) rather than store half a picture.
const FAIL_ON = "warning";
const WEBP_QUALITY = 85;
const WEBP_EFFORT = 4;
const MAX_CONCURRENT = 2;

export interface ProcessedImage {
  /** The WebP file to store. */
  bytes: Buffer;
  width: number;
  height: number;
  mime: typeof UPLOAD_MIME;
}

// At most MAX_CONCURRENT images are decoded at once: each one is up to MAX_INPUT_PIXELS × 4 bytes in memory. A finishing task hands its
// slot straight to the next in line, so the count never exceeds the limit.
let running = 0;
const waiting: (() => void)[] = [];

async function inSlot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) await new Promise<void>((resume) => waiting.push(resume));
  else running += 1;
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running -= 1;
  }
}

const unreadable = (message: string) => new Invalid([{ path: "file", message }]);

/** What went wrong inside the decoder, in words for the editor (the decoder's own messages are English and name internals). */
function describeFailure(error: unknown): Invalid {
  const text = error instanceof Error ? error.message : "";
  if (/pixel limit/i.test(text)) return unreadable(`Ảnh quá lớn về kích thước (tối đa ${MAX_INPUT_PIXELS / 1_000_000} triệu điểm ảnh). Hãy thu nhỏ ảnh rồi tải lên lại.`);
  return unreadable("Không đọc được ảnh này — tệp có thể bị hỏng hoặc bị cắt dở. Hãy xuất lại ảnh từ phần mềm thiết kế rồi thử lại.");
}

/** Decodes `input` and returns the WebP that is stored in its place. Throws `Invalid` for anything the decoder refuses. */
export function processImage(input: Buffer): Promise<ProcessedImage> {
  return inSlot(async () => {
    try {
      const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: FAIL_ON })
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
        .toBuffer({ resolveWithObject: true });
      return { bytes: data, width: info.width, height: info.height, mime: UPLOAD_MIME };
    } catch (error) {
      throw describeFailure(error);
    }
  });
}
