"use client";

import { createContext, useContext } from "react";
import type { Navigation } from "@/lib/content/read/navigation";

// The site's navigation for the page's language — categories, their product cards and mega-menus — read from the content database
// once by the locale layout (a server component) and handed down here, so the navbar, footer and home sections need no data of their own.

const SiteDataContext = createContext<Navigation | null>(null);

export function SiteDataProvider({ navigation, children }: Readonly<{ navigation: Navigation; children: React.ReactNode }>) {
  return <SiteDataContext.Provider value={navigation}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): Navigation {
  const navigation = useContext(SiteDataContext);
  if (!navigation) throw new Error("useSiteData() needs a <SiteDataProvider> above it (app/[locale]/layout.tsx mounts one)");
  return navigation;
}
