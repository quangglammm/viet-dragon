"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { MARKETING_SUBMENU_COLUMNS } from "@/data/marketing-menu";
import { isSubmenuItemActive } from "@/lib/menu-active";
import { useCurrentHash } from "@/hooks/use-current-hash";
import { cn } from "@/lib/utils";

const FAST_PRINT_TAGS: Record<Locale, string> = {
  vi: "in nhanh",
  en: "fast",
  zh: "快印",
  ja: "特急",
  ko: "당일인쇄",
};

export function MarketingMobileSubmenu({
  locale,
  onItemClick,
}: Readonly<{
  locale: Locale;
  onItemClick?: () => void;
}>) {
  const pathname = usePathname();
  const currentHash = useCurrentHash();
  const allGroups = MARKETING_SUBMENU_COLUMNS.flatMap((col) => col.groups);

  const handleItemClick = () => {
    onItemClick?.();
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new Event("hashchange"));
        window.dispatchEvent(new Event("shape-select"));
      }, 50);
    }
  };

  return (
    <div className="pl-4 pr-2 py-2 flex flex-col gap-4 border-l-2 border-brand-primary/30 ml-4 my-1">
      {allGroups.map((group) => (
        <div key={group.id} className="flex flex-col">
          <Link
            href={group.href}
            onClick={handleItemClick}
            className="text-[14px] font-bold text-brand-primary mb-1.5 pb-0.5 border-b border-brand-primary/20 inline-block"
          >
            {pickLocale(
              locale,
              group.titleVi,
              group.titleEn,
              group.titleZh,
              group.titleJa,
              group.titleKo
            )}
          </Link>
          <ul className="flex flex-col gap-1 pl-1">
            {group.items.map((item) => {
              const isActive = isSubmenuItemActive(item.href, pathname, currentHash);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleItemClick}
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-sm transition-all",
                      isActive
                        ? "text-brand-primary font-bold bg-brand-soft/90 shadow-2xs"
                        : "text-zinc-700 hover:text-brand-primary hover:bg-zinc-50/50"
                    )}
                  >
                    <span className="leading-snug">
                      {pickLocale(
                        locale,
                        item.nameVi,
                        item.nameEn,
                        item.nameZh,
                        item.nameJa,
                        item.nameKo
                      )}
                    </span>
                    {item.isFast && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#f5a623] rounded leading-none shrink-0 ml-1.5">
                        {FAST_PRINT_TAGS[locale] || "in nhanh"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
