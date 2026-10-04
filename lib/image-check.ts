import fs from "node:fs";
import path from "node:path";
import type { ProductOption } from "@/data/categories";

/**
 * Checks whether an image path exists on disk under public/ (or is a valid external URL).
 */
export function checkPublicImageExists(imgUrl?: string): boolean {
  if (!imgUrl || typeof imgUrl !== "string") return false;
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return true;

  try {
    const relativePath = imgUrl.startsWith("/") ? imgUrl.slice(1) : imgUrl;
    const cleanPath = relativePath.split("?")[0].split("#")[0];
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
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
