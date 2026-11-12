// Static Mock Data for Viet Dragon
import type { Catalog, MenuView } from "@/lib/content/read/types";
import type { FastPrint, ShowcaseItemView } from "@/lib/content/read/merchandising";
import type { Blog } from "@/lib/content/read/posts";

import rawCatalog from "./catalog.json";
import rawMenus from "./menus.json";
import rawBlog from "./blog.json";
import rawFastPrint from "./fast-print.json";
import rawShowcase from "./showcase.json";
import rawRevisionDates from "./revision-dates.json";

export const mockCatalog = rawCatalog as unknown as Catalog;
export const mockMenus = rawMenus as unknown as Record<string, MenuView>;
export const mockBlog = rawBlog as unknown as Blog;
export const mockFastPrint = rawFastPrint as unknown as FastPrint;
export const mockShowcase = rawShowcase as unknown as ShowcaseItemView[];
export const mockRevisionDates = rawRevisionDates as unknown as Record<string, string>;
