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
  usedIn?: string[];
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

function sanitizeOriginalFilename(originalName: string): { base: string; ext: string } {
  const ext = path.extname(originalName).toLowerCase() || ".png";
  const nameOnly = path.basename(originalName, ext);

  // Strip Vietnamese accents
  const asciiName = removeVietnameseTones(nameOnly);

  // Keep alphanumeric, underscore, dash; replace spaces/special chars with dash without cutting length
  let base = asciiName
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) {
    base = "media";
  }

  return { base, ext };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getUsedMediaMap(): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();

  const registerUsage = (rawUrl: string | undefined | null, source: string) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    const normalized = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    const list = map.get(normalized) || [];
    if (!list.includes(source)) {
      list.push(source);
      map.set(normalized, list);
    }
  };

  try {
    const categories = await getStoredProducts();
    for (const cat of categories) {
      registerUsage(cat.coverImage, `Danh mục: ${cat.nameVi || cat.nameEn}`);
      for (const prod of cat.items || []) {
        registerUsage(prod.image, `Sản phẩm: ${prod.nameVi || prod.nameEn}`);
        if (prod.images) {
          for (const img of prod.images) {
            registerUsage(img, `Sản phẩm (phụ): ${prod.nameVi || prod.nameEn}`);
          }
        }
        for (const group of prod.optionGroups || []) {
          for (const opt of group.options || []) {
            registerUsage(opt.image, `Tùy chọn "${opt.nameVi || opt.name}" (${prod.nameVi || prod.nameEn})`);
            if (opt.images) {
              for (const img of opt.images) {
                registerUsage(img, `Tùy chọn (phụ) "${opt.nameVi || opt.name}" (${prod.nameVi || prod.nameEn})`);
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore reading error
  }

  try {
    const posts = await getStoredBlogPosts();
    for (const post of posts) {
      registerUsage(post.coverImage, `Bài viết: ${post.title || post.titleEn}`);
    }
  } catch {
    // Ignore reading error
  }

  return map;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  await ensureDirs();
  const assets: MediaAsset[] = [];
  const usedMap = await getUsedMediaMap();

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
                usedIn: usedMap.get(url),
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

  const { base, ext } = sanitizeOriginalFilename(file.name);

  // Check all existing media files across the entire library in public/
  const existingAssets = await getMediaAssets();
  const takenFilenames = new Set(existingAssets.map((a) => a.filename.toLowerCase()));

  // 1. If original name is NOT duplicate, keep original name as-is
  let finalName = `${base}${ext}`;
  let filePath = path.join(UPLOADS_DIR, finalName);

  const isTaken =
    takenFilenames.has(finalName.toLowerCase()) || (await fileExists(filePath));

  // 2. Only if the name is already taken, append a short incremental number suffix
  if (isTaken) {
    let counter = 1;
    let candidate = `${base}-${counter}${ext}`;
    while (
      takenFilenames.has(candidate.toLowerCase()) ||
      (await fileExists(path.join(UPLOADS_DIR, candidate)))
    ) {
      counter++;
      candidate = `${base}-${counter}${ext}`;
    }
    finalName = candidate;
    filePath = path.join(UPLOADS_DIR, finalName);
  }

  await fs.writeFile(filePath, buffer);

  const isVideo = VIDEO_EXTS.has(ext);

  return {
    filename: finalName,
    url: `/uploads/${finalName}`,
    size: buffer.length,
    updatedAt: new Date().toISOString(),
    type: isVideo ? "video" : "image",
    folder: "uploads",
  };
}

export async function deleteMediaFiles(urls: string[]): Promise<{
  success: boolean;
  deleted: string[];
  failed: { url: string; error: string }[];
}> {
  await ensureDirs();
  const deleted: string[] = [];
  const failed: { url: string; error: string }[] = [];

  for (const rawUrl of urls) {
    if (!rawUrl || typeof rawUrl !== "string") continue;
    const cleanUrl = rawUrl.replace(/^\/+/, "");
    const resolvedPath = path.resolve(PUBLIC_DIR, cleanUrl);

    // Security check 1: Path must be strictly inside PUBLIC_DIR
    if (!resolvedPath.startsWith(PUBLIC_DIR)) {
      failed.push({ url: rawUrl, error: "Đường dẫn không hợp lệ hoặc nằm ngoài thư mục public" });
      continue;
    }

    // Security check 2: Prevent deleting public directory or root subdirectories
    if (
      resolvedPath === PUBLIC_DIR ||
      resolvedPath === UPLOADS_DIR ||
      resolvedPath === path.join(PUBLIC_DIR, "images") ||
      resolvedPath === path.join(PUBLIC_DIR, "videos")
    ) {
      failed.push({ url: rawUrl, error: "Không được phép xóa thư mục hệ thống" });
      continue;
    }

    try {
      const stat = await fs.stat(resolvedPath);
      if (!stat.isFile()) {
        failed.push({ url: rawUrl, error: "Chỉ được phép xóa tệp tin, không được xóa thư mục" });
        continue;
      }
      await fs.unlink(resolvedPath);
      deleted.push(rawUrl);
    } catch {
      failed.push({ url: rawUrl, error: "Tệp tin không tồn tại hoặc đã bị xóa" });
    }
  }

  return {
    success: failed.length === 0,
    deleted,
    failed,
  };
}
