import type { ProductOption } from "@/data/categories";

/**
 * Checks whether an image path is a valid non-empty string URL or path.
 * Avoids node:fs to prevent Next.js NFT from tracing and bundling the entire public/ directory.
 */
export function checkPublicImageExists(imgUrl?: string): boolean {
  if (!imgUrl || typeof imgUrl !== "string") return false;
  return imgUrl.trim().length > 0;
}

/**
 * Sanitizes ProductOption image paths so non-existent files are passed as empty strings,
 * allowing components to render clean placeholders without triggering Next.js 400 optimizer errors.
 */
export function sanitizeOptionImages(opt: ProductOption): ProductOption {
  const sanitizeList = (list?: string[]) => {
    if (!list || list.length === 0) return undefined;
    return list.map((url) => (checkPublicImageExists(url) ? url : ""));
  };

  return {
    ...opt,
    pureImage: checkPublicImageExists(opt.pureImage) ? opt.pureImage : undefined,
    pureImages: sanitizeList(opt.pureImages),
    image: checkPublicImageExists(opt.image) ? opt.image : undefined,
    images: sanitizeList(opt.images),
  };
}
