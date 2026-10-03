"use client";

import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { TET_SUBMENU_COLUMNS } from "@/data/tet-menu";

const FAST_PRINT_TAGS: Record<Locale, string> = {
  vi: "in nhanh",
  en: "fast",
  zh: "快印",
  ja: "特急",
  ko: "당일인쇄",
};

export function TetMobileSubmenu({
  locale,
  onItemClick,
}: Readonly<{
  locale: Locale;
  onItemClick?: () => void;
}>) {
  const allGroups = TET_SUBMENU_COLUMNS.flatMap((col) => col.groups);

  return (
    <div className="pl-4 pr-2 py-2 flex flex-col gap-4 border-l-2 border-[#006837]/30 ml-4 my-1">
      {allGroups.map((group) => (
        <div key={group.id} className="flex flex-col">
          <Link
            href={group.href}
            onClick={onItemClick}
            className="text-[14px] font-bold text-[#006837] mb-1.5 pb-0.5 border-b border-[#006837]/20 inline-block"
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
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className="flex items-center justify-between py-1.5 text-sm text-zinc-700 hover:text-[#006837] transition-colors"
                >
                  <span>
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
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
