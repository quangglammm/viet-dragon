import fs from "fs/promises";
import path from "path";
import { routing, type Locale } from "@/i18n/routing";
import { type ProductCategory, type ProductItem, showcaseImages } from "@/data/categories";
import {
  MAIN_CATEGORIES,
  SUBGROUPS_CATALOG,
  type SubgroupCategory,
  type ProductCategoryDef,
} from "@/data/subgroups-catalog";
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
// PRODUCTS & SUBGROUPS
// -------------------------------------------------------------

const PRODUCTS_JSON_PATH = path.join(CONTENT_DIR, "products.json");
const SUBGROUPS_JSON_PATH = path.join(CONTENT_DIR, "subgroups.json");

/**
 * Builds standard ProductCategory[] from the structured Subgroup catalog.
 */
export function buildProductCategoriesFromSubgroups(
  categoriesDef: ProductCategoryDef[] = MAIN_CATEGORIES,
  subgroupsList: SubgroupCategory[] = SUBGROUPS_CATALOG
): ProductCategory[] {
  return categoriesDef.map((cat) => {
    const catSubgroups = subgroupsList.filter((s) => s.categoryId === cat.id);
    const items: ProductItem[] = catSubgroups.map((sub) => ({
      id: sub.id,
      nameVi: sub.titleVi,
      nameEn: sub.titleEn,
      descriptionVi: sub.descriptionVi,
      description: sub.descriptionEn,
      image: sub.coverImage,
      shapes: sub.shapes,
      optionGroups:
        sub.materials && sub.materials.length > 0 ? [{ options: sub.materials }] : [],
    }));

    return {
      id: cat.id,
      nameVi: cat.nameVi,
      nameEn: cat.nameEn,
      descriptionVi: cat.descriptionVi,
      description: cat.description,
      icon: cat.icon,
      coverImage: cat.coverImage,
      items,
    };
  });
}

export async function getStoredSubgroups(): Promise<SubgroupCategory[]> {
  await ensureDirs();
  try {
    const content = await fs.readFile(SUBGROUPS_JSON_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // If not written yet, return static SUBGROUPS_CATALOG
  }
  return SUBGROUPS_CATALOG;
}

export async function saveStoredSubgroups(subgroups: SubgroupCategory[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(SUBGROUPS_JSON_PATH, JSON.stringify(subgroups, null, 2), "utf-8");
}

export async function getStoredProducts(): Promise<ProductCategory[]> {
  await ensureDirs();
  try {
    const content = await fs.readFile(PRODUCTS_JSON_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((cat: ProductCategory) => ({
        ...cat,
        items: Array.isArray(cat.items) ? cat.items : [],
      }));
    }
  } catch {
    // File not found or invalid
  }

  // Fallback to building from stored/static subgroups
  const storedSubgroups = await getStoredSubgroups();
  const defaultCats = buildProductCategoriesFromSubgroups(MAIN_CATEGORIES, storedSubgroups);
  try {
    await fs.writeFile(PRODUCTS_JSON_PATH, JSON.stringify(defaultCats, null, 2), "utf-8");
  } catch {
    // Ignore write failure on readonly systems
  }
  return defaultCats;
}

export async function saveStoredProducts(categories: ProductCategory[]): Promise<void> {
  await ensureDirs();
  await fs.writeFile(PRODUCTS_JSON_PATH, JSON.stringify(categories, null, 2), "utf-8");

  // Keep subgroups.json synchronized with any updates made through the CMS Admin
  try {
    const currentSubgroups = await getStoredSubgroups();
    const updatedSubgroups = currentSubgroups.map((sub) => {
      for (const cat of categories) {
        const matchedItem = cat.items?.find((item) => item.id === sub.id);
        if (matchedItem) {
          return {
            ...sub,
            titleVi: matchedItem.nameVi || sub.titleVi,
            titleEn: matchedItem.nameEn || sub.titleEn,
            descriptionVi: matchedItem.descriptionVi || sub.descriptionVi,
            descriptionEn: matchedItem.description || sub.descriptionEn,
            coverImage: matchedItem.image || sub.coverImage,
            materials: matchedItem.optionGroups?.[0]?.options || sub.materials,
          };
        }
      }
      return sub;
    });

    await saveStoredSubgroups(updatedSubgroups);
  } catch {
    // Ignore auxiliary sync failure
  }
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

function registerSubgroupMedia(
  subgroups: SubgroupCategory[],
  register: (url: string | undefined | null, source: string) => void
) {
  for (const sub of subgroups) {
    const sName = sub.titleVi || sub.titleEn;
    register(sub.coverImage, `Nhóm sản phẩm: ${sName}`);
    for (const shape of sub.shapes || []) {
      register(shape.image, `Hình thức "${shape.nameVi}" (${sName})`);
      for (const opt of shape.materials || []) {
        const oName = opt.nameVi || opt.name || "Chất liệu";
        register(opt.image, `Chất liệu "${oName}" (Hình thức ${shape.nameVi} - ${sName})`);
        opt.images?.forEach((img) => register(img, `Chất liệu (phụ) "${oName}" (Hình thức ${shape.nameVi} - ${sName})`));
        register(opt.pureImage, `Chất liệu (ảnh mộc) "${oName}" (Hình thức ${shape.nameVi} - ${sName})`);
        opt.pureImages?.forEach((img) => register(img, `Chất liệu (ảnh mộc) "${oName}" (Hình thức ${shape.nameVi} - ${sName})`));
      }
    }
    for (const opt of sub.materials || []) {
      const oName = opt.nameVi || opt.name || "Chất liệu";
      register(opt.image, `Chất liệu "${oName}" (${sName})`);
      opt.images?.forEach((img) => register(img, `Chất liệu (phụ) "${oName}" (${sName})`));
      register(opt.pureImage, `Chất liệu (ảnh mộc) "${oName}" (${sName})`);
      opt.pureImages?.forEach((img) => register(img, `Chất liệu (ảnh mộc) "${oName}" (${sName})`));
    }
  }
}

function registerProductMedia(
  items: Array<{
    nameVi?: string;
    nameEn?: string;
    image?: string;
    images?: string[];
    pureImage?: string;
    pureImages?: string[];
    optionGroups?: Array<{
      options: Array<{
        name?: string;
        nameVi?: string;
        image?: string;
        images?: string[];
        pureImage?: string;
        pureImages?: string[];
      }>;
    }>;
  }>,
  register: (url: string | undefined | null, source: string) => void
) {
  for (const prod of items) {
    const pName = prod.nameVi || prod.nameEn || "Sản phẩm";
    register(prod.image, `Sản phẩm: ${pName}`);
    prod.images?.forEach((img) => register(img, `Sản phẩm (phụ): ${pName}`));
    register(prod.pureImage, `Sản phẩm (ảnh mộc): ${pName}`);
    prod.pureImages?.forEach((img) => register(img, `Sản phẩm (ảnh mộc): ${pName}`));

    for (const group of prod.optionGroups || []) {
      for (const opt of group.options || []) {
        const oName = opt.nameVi || opt.name || "Chất liệu";
        register(opt.image, `Tùy chọn "${oName}" (${pName})`);
        opt.images?.forEach((img) => register(img, `Tùy chọn (phụ) "${oName}" (${pName})`));
        register(opt.pureImage, `Tùy chọn (ảnh mộc) "${oName}" (${pName})`);
        opt.pureImages?.forEach((img) => register(img, `Tùy chọn (ảnh mộc) "${oName}" (${pName})`));
      }
    }
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

  // 1. Scan Main Categories
  for (const cat of MAIN_CATEGORIES) {
    registerUsage(cat.coverImage, `Danh mục chính: ${cat.nameVi || cat.nameEn}`);
  }

  // 2. Scan Showcase Images
  for (const s of showcaseImages) {
    registerUsage(s.src, `Showcase: ${s.label}`);
  }

  // 3. Scan Subgroups Catalog (including all shapes and 110+ materials)
  try {
    const subgroups = await getStoredSubgroups();
    registerSubgroupMedia(subgroups, registerUsage);
  } catch {
    // Ignore reading error
  }

  // 4. Scan Stored Products in content/products.json
  try {
    const categories = await getStoredProducts();
    for (const cat of categories) {
      registerUsage(cat.coverImage, `Danh mục: ${cat.nameVi || cat.nameEn}`);
      registerProductMedia(cat.items || [], registerUsage);
    }
  } catch {
    // Ignore reading error
  }

  // 5. Scan Stored Blog Posts
  try {
    const posts = await getStoredBlogPosts();
    for (const post of posts) {
      registerUsage(post.coverImage, `Bài viết: ${post.title || post.titleEn}`);
    }
  } catch {
    // Ignore reading error
  }

  // 6. Scan Landing & Static Brand Assets
  registerUsage("/images/cta/vd-cta-banner.jpg", "CTA Banner");
  registerUsage("/images/about/vd-about-team.webp", "Giới thiệu / Về chúng tôi");
  registerUsage("/videos/about.mp4", "Video giới thiệu (About loop)");

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
