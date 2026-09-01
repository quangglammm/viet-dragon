import fs from "fs/promises";
import path from "path";
import { routing, type Locale } from "@/i18n/routing";
import { productCategories, type ProductCategory } from "@/data/categories";
import { blogPosts, type BlogPost } from "@/data/posts";

const ROOT_DIR = process.cwd();
const MESSAGES_DIR = path.join(ROOT_DIR, "messages");
const DATA_DIR = path.join(ROOT_DIR, "data");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");

// Ensure content and upload directories exist
async function ensureDirs() {
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

// -------------------------------------------------------------
// TRANSLATIONS
// -------------------------------------------------------------

export type TranslationBundle = Record<Locale, Record<string, unknown>>;

export async function getAllTranslations(): Promise<TranslationBundle> {
  const result: Partial<TranslationBundle> = {};

  for (const locale of routing.locales) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      result[locale] = JSON.parse(content);
    } catch {
      result[locale] = {};
    }
  }

  return result as TranslationBundle;
}

export async function saveTranslationLocale(locale: Locale, messages: Record<string, unknown>): Promise<void> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  await fs.writeFile(filePath, JSON.stringify(messages, null, 2), "utf-8");
}

export async function saveAllTranslations(bundle: TranslationBundle): Promise<void> {
  for (const locale of routing.locales) {
    if (bundle[locale]) {
      await saveTranslationLocale(locale, bundle[locale]);
    }
  }
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------

const PRODUCTS_JSON_PATH = path.join(CONTENT_DIR, "products.json");

export async function getStoredProducts(): Promise<ProductCategory[]> {
  await ensureDirs();
  try {
    const content = await fs.readFile(PRODUCTS_JSON_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    // If not written yet, return default static categories
    return productCategories;
  }
}

export async function saveStoredProducts(categories: ProductCategory[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(PRODUCTS_JSON_PATH, JSON.stringify(categories, null, 2), "utf-8");
}

// -------------------------------------------------------------
// BLOG POSTS
// -------------------------------------------------------------

const POSTS_JSON_PATH = path.join(CONTENT_DIR, "posts.json");

export async function getStoredBlogPosts(): Promise<BlogPost[]> {
  await ensureDirs();
  try {
    const content = await fs.readFile(POSTS_JSON_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return blogPosts;
  }
}

export async function saveStoredBlogPosts(posts: BlogPost[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(POSTS_JSON_PATH, JSON.stringify(posts, null, 2), "utf-8");
}

// -------------------------------------------------------------
// MEDIA ASSETS (RECURSIVE SCANNER FOR ALL IMAGES & VIDEOS IN PUBLIC)
// -------------------------------------------------------------

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif", ".ico"]);
const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".mkv", ".ogv"]);

export interface MediaAsset {
  filename: string;
  url: string;
  size: number;
  updatedAt: string;
  type: "image" | "video";
  folder: string;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  await ensureDirs();
  const assets: MediaAsset[] = [];

  // Recursive directory scanner function
  async function scanDirectory(dirPath: string) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          const isImage = IMAGE_EXTS.has(ext);
          const isVideo = VIDEO_EXTS.has(ext);

          if (isImage || isVideo) {
            try {
              const stat = await fs.stat(fullPath);
              const relPath = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, "/");
              const url = `/${relPath}`;

              // Determine subfolder category
              const pathParts = relPath.split("/");
              let folder = "root";
              if (pathParts.length > 1) {
                if (pathParts[0] === "images" && pathParts.length > 2) {
                  folder = pathParts[1]; // e.g. "product", "hero", "blog", "about", "portfolio", "category", "cta", "faq", "quality", "services"
                } else {
                  folder = pathParts[0]; // e.g. "videos", "uploads"
                }
              }

              assets.push({
                filename: entry.name,
                url,
                size: stat.size,
                updatedAt: stat.mtime.toISOString(),
                type: isVideo ? "video" : "image",
                folder,
              });
            } catch {
              // Ignore stat error for unreadable file
            }
          }
        }
      }
    } catch {
      // Directory cannot be read
    }
  }

  await scanDirectory(PUBLIC_DIR);

  // Return all assets sorted by modification date descending
  return assets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function saveUploadedFile(file: File): Promise<MediaAsset> {
  await ensureDirs();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const nameOnly = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
  const uniqueName = `${nameOnly}-${Date.now()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  await fs.writeFile(filePath, buffer);

  const isVideo = VIDEO_EXTS.has(ext);

  return {
    filename: uniqueName,
    url: `/uploads/${uniqueName}`,
    size: buffer.length,
    updatedAt: new Date().toISOString(),
    type: isVideo ? "video" : "image",
    folder: "uploads",
  };
}
