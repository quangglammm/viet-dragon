import fs from "node:fs";
import path from "node:path";
import * as schema from "@/lib/db/schema";
import { ICON_NAMES, ICONS, isIconName } from "@/lib/icons";
import type { MediaRegistry, SeedContext } from "../context";
import { LOCALES, TRANSLATED_LOCALES, localizedText, translated, type Locale } from "../localized";
import { parsePrice } from "../parse";
import { bump, isBlankText, majority, orNull, slugify, storageKeyOf } from "../util";

// Files, categories, the trait glossary and the units.

const MIME: Record<string, string> = {
  webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", avif: "image/avif",
  svg: "image/svg+xml", ico: "image/x-icon", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};
const MEDIA_ROOTS = ["images", "videos", "uploads"] as const;
/** Editor backups and OS litter that must not become media rows. They are listed in the report. */
const STRAY_FILE = /(\.bak$|\.prev\.|test-new-|\.DS_Store$)/;
const INSERT_BATCH = 400;

function listFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? listFiles(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))
    .sort();
}

/** Registers every file under public/images, videos and uploads, so documents can refer to a file by its storage key. */
export async function seedMedia({ tx, src, notes }: SeedContext): Promise<MediaRegistry> {
  const publicDirectory = path.join(src.root, "public");
  const rows: (typeof schema.media.$inferInsert)[] = [];
  for (const top of MEDIA_ROOTS) {
    for (const file of listFiles(path.join(publicDirectory, top))) {
      const key = path.relative(publicDirectory, file).split(path.sep).join("/");
      const mime = MIME[path.extname(file).slice(1).toLowerCase()];
      if (STRAY_FILE.test(key)) notes.add("media-stray", key);
      else if (!mime) notes.add("media-unknown-extension", key);
      else {
        rows.push({ source: top === "uploads" ? "upload" : "static", storageKey: key, kind: mime.startsWith("video") ? "video" : "image", mime, bytes: fs.statSync(file).size });
      }
    }
  }
  const registered = new Map<string, number>();
  for (let start = 0; start < rows.length; start += INSERT_BATCH) {
    const inserted = await tx.insert(schema.media).values(rows.slice(start, start + INSERT_BATCH)).returning({ id: schema.media.id, storageKey: schema.media.storageKey });
    for (const row of inserted) registered.set(row.storageKey, row.id);
  }
  const referenced = new Set<string>();
  return {
    registered,
    referenced,
    idOf: (publicPath) => {
      if (isBlankText(publicPath)) return null;
      const key = storageKeyOf(publicPath as string);
      const id = registered.get(key);
      if (id === undefined) {
        notes.add("media-unresolved", publicPath as string);
        return null;
      }
      referenced.add(key);
      return id;
    },
  };
}

export async function seedCategories({ tx, src, notes }: SeedContext, media: MediaRegistry): Promise<void> {
  for (const [index, c] of src.categories.entries()) {
    if (!isIconName(c.icon)) throw new Error(`Category ${c.id} uses the icon "${c.icon}", which is not in lib/icons.ts`);
    if (c.description !== c.descriptionEn) notes.add("category-description-differs", c.id);
    await tx.insert(schema.category).values({ id: c.id, icon: c.icon, coverMediaId: media.idOf(c.coverImage), position: index });
    await tx.insert(schema.categoryI18n).values([
      { categoryId: c.id, locale: "vi", name: c.nameVi, description: orNull(c.descriptionVi) },
      { categoryId: c.id, locale: "en", name: c.nameEn, description: orNull(c.descriptionEn) },
      ...TRANSLATED_LOCALES.flatMap((locale) => {
        const name = translated(src.translations.CATEGORY_NAMES, c.id, locale);
        return name ? [{ categoryId: c.id, locale, name, description: orNull(translated(src.translations.CATEGORY_DESCS, c.id, locale)) }] : [];
      }),
    ]);
  }
}

/** The trait glossary. The icon is stored as a registry name, found by looking the lucide component up in lib/icons.ts. */
export async function seedTraits({ tx, src }: SeedContext): Promise<ReadonlySet<string>> {
  const keys = new Set<string>();
  for (const [key, definition] of Object.entries(src.traits)) {
    const icon = ICON_NAMES.find((name) => ICONS[name] === definition.icon);
    if (!icon) throw new Error(`The trait "${key}" uses an icon that is not in lib/icons.ts`);
    await tx.insert(schema.trait).values({ key, icon });
    await tx.insert(schema.traitI18n).values([
      { traitKey: key, locale: "vi", label: definition.labelVi, description: orNull(definition.descriptionVi) },
      { traitKey: key, locale: "en", label: definition.label, description: orNull(definition.description) },
    ]);
    keys.add(key);
  }
  return keys;
}

/** The unit a Fast Print price is quoted in, as a key ("Chỉ từ 120.000đ/Hộp" → "hop"); null when the price cannot be parsed. */
export function fastPrintUnitKey(priceVi: string): string | null {
  const price = parsePrice(priceVi);
  return price ? slugify(price.unit) : null;
}

/** Units come from the Fast Print prices; each language's label is the most frequent spelling of that unit. */
export async function seedUnits({ tx, src, notes }: SeedContext): Promise<void> {
  const labels = new Map<string, Record<Locale, Map<string, number>>>();
  for (const item of src.fastPrint) {
    const vi = parsePrice(item.priceVi);
    if (!vi) {
      notes.add("fastprint-price-unparsed", item.id);
      continue;
    }
    const key = slugify(vi.unit);
    const perLocale = labels.get(key) ?? labels.set(key, Object.fromEntries(LOCALES.map((l) => [l, new Map<string, number>()])) as Record<Locale, Map<string, number>>).get(key)!;
    for (const locale of LOCALES) {
      const price = parsePrice(localizedText(item, "price", "suffixed", locale) ?? "");
      if (!price) notes.add("fastprint-price-unparsed", `${item.id} ${locale}`);
      else {
        if (price.amount !== vi.amount) notes.add("fastprint-price-differs-by-locale", `${item.id} ${locale}`);
        bump(perLocale[locale], price.unit);
      }
    }
  }
  for (const [key, perLocale] of labels) {
    await tx.insert(schema.unit).values({ key });
    await tx.insert(schema.unitI18n).values(LOCALES.filter((l) => perLocale[l].size > 0).map((locale) => ({ unitKey: key, locale, label: majority(perLocale[locale]).value })));
  }
}
