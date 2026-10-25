import { describe, expect, it } from "vitest";
import { Layers, Zap } from "lucide-react";
import { MAIN_CATEGORIES, SUBGROUPS_CATALOG } from "@/scripts/seed/legacy/subgroups-catalog";
import { materialTraits } from "@/scripts/seed/legacy/material-traits";
import { PRINT_PRODUCTS } from "@/scripts/seed/legacy/fast-print";
import { ICON_NAMES, ICONS, isIconName, resolveIcon } from "./icons";

// The registry is checked against what the site actually uses today, so the Phase 3b seed can store every icon by name.

const NAME_FORMAT = /^[A-Za-z0-9]+$/; // the database's icon CHECK

describe("icon registry", () => {
  it("names are valid database icon names", () => {
    expect(ICON_NAMES.filter((name) => !NAME_FORMAT.test(name))).toEqual([]);
  });

  it("covers every icon name used by the catalog data", () => {
    const used = new Set<string>(MAIN_CATEGORIES.map((category) => category.icon));
    for (const subgroup of SUBGROUPS_CATALOG) {
      for (const material of [...(subgroup.materials ?? []), ...subgroup.shapes.flatMap((shape) => shape.materials ?? [])]) {
        if (material.icon) used.add(material.icon);
      }
    }
    expect(used.size).toBeGreaterThanOrEqual(16);
    expect([...used].filter((name) => !isIconName(name))).toEqual([]);
  });

  it("covers every trait icon", () => {
    const registered = new Set<unknown>(Object.values(ICONS));
    expect(Object.entries(materialTraits).filter(([, trait]) => !registered.has(trait.icon)).map(([key]) => key)).toEqual([]);
  });

  it("covers every icon of the Fast Print items (the seed stores them by name)", () => {
    const names = PRINT_PRODUCTS.map((item) => item.icon);
    expect(names).toHaveLength(6);
    expect(names.filter((name) => !isIconName(name))).toEqual([]);
  });

  it("resolves a stored name to its component and falls back safely", () => {
    expect(resolveIcon("Zap")).toBe(Zap);
    expect(resolveIcon("NotAnIcon")).toBe(Layers);
    expect(resolveIcon(null)).toBe(Layers);
    expect(resolveIcon("", Zap)).toBe(Zap);
    expect(resolveIcon("constructor")).toBe(Layers);
  });
});
