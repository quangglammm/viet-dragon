import type { LocaleCode } from "../schemas";
import { getCatalog, getMenus } from "./load";
import { navigationOf, type Navigation } from "./navigation";

/** The navigation of the page's language, from the cached catalog and menus: what the locale layout hands the client chrome and the index pages list. */
export async function getNavigation(locale: LocaleCode): Promise<Navigation> {
  const [catalog, menus] = await Promise.all([getCatalog(), getMenus()]);
  return navigationOf(catalog, menus, locale);
}
