import { describe, expect, it } from "vitest";
import { Layers, Zap } from "lucide-react";
import { mockCatalog } from "@/lib/mock-data";
import { ICON_NAMES, isIconName, resolveIcon } from "./icons";

const NAME_FORMAT = /^[A-Za-z0-9]+$/;

describe("icon registry", () => {
  it("names are valid icon names", () => {
    expect(ICON_NAMES.filter((name) => !NAME_FORMAT.test(name))).toEqual([]);
  });

  it("covers every icon name used by the catalog data", () => {
    const used = new Set<string>(mockCatalog.categories.map((c) => c.icon));
    for (const material of Object.values(mockCatalog.materials)) {
      if (material.icon) used.add(material.icon);
    }
    expect(used.size).toBeGreaterThanOrEqual(10);
    expect([...used].filter((name) => !isIconName(name))).toEqual([]);
  });

  it("resolves a stored name to its component and falls back safely", () => {
    expect(resolveIcon("Zap")).toBe(Zap);
    expect(resolveIcon("NotAnIcon")).toBe(Layers);
    expect(resolveIcon(null)).toBe(Layers);
    expect(resolveIcon("", Zap)).toBe(Zap);
    expect(resolveIcon("constructor")).toBe(Layers);
  });
});
