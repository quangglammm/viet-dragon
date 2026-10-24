import type { Tx } from "@/lib/db/types";
import { emptyStats, type MaterialRecord, type MediaRegistry, type OptionModel, type ProductRecord, type SeedContext, type SeedStats } from "./context";
import { Notes } from "./notes";
import type { Sources } from "./sources";
import { seedProductAliases, seedSegmentAliases } from "./steps/aliases";
import { seedCategories, seedMedia, seedTraits, seedUnits } from "./steps/foundations";
import { seedMaterials } from "./steps/materials";
import { seedOptions } from "./steps/options";
import { seedProducts } from "./steps/catalog";
import { seedRevisions } from "./steps/revisions";
import { seedBlog } from "./steps/blog";
import { seedLegacy } from "./steps/legacy";
import { seedFastPrint, seedShowcase } from "./steps/merchandising";
import { seedMenus } from "./steps/menus";
import { seedMessages } from "./steps/messages";
import { seedSizes, seedSpecs } from "./steps/sizes-specs";

export interface SeedOutcome {
  notes: Notes;
  stats: SeedStats;
  media: MediaRegistry;
  traitKeys: ReadonlySet<string>;
  materials: Map<string, MaterialRecord>;
  optionModels: OptionModel[];
  products: Map<string, ProductRecord>;
  revisions: number;
}

/** Writes the whole content model from the site's sources. Call inside ONE transaction. */
export async function runSeed(tx: Tx, src: Sources): Promise<SeedOutcome> {
  const ctx: SeedContext = { tx, src, notes: new Notes(), stats: emptyStats() };
  const media = await seedMedia(ctx);
  await seedCategories(ctx, media);
  const traitKeys = await seedTraits(ctx);
  await seedUnits(ctx);
  const { materials, models } = await seedMaterials(ctx);
  const products = await seedProducts(ctx, media);
  await seedOptions(ctx, products, materials, models, traitKeys, media);
  await seedProductAliases(ctx, products);
  await seedSegmentAliases(ctx, products);
  await seedMenus(ctx, products, media);
  await seedSizes(ctx, products);
  await seedSpecs(ctx, products);
  await seedFastPrint(ctx, media);
  await seedShowcase(ctx, media);
  await seedBlog(ctx, media);
  await seedMessages(ctx);
  await seedLegacy(ctx);
  const revisions = await seedRevisions(ctx);
  return { notes: ctx.notes, stats: ctx.stats, media, traitKeys, materials, optionModels: models, products, revisions };
}
