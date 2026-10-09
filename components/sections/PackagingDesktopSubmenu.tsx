"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { PACKAGING_SUBMENU_COLUMNS } from "@/data/packaging-menu";
import { isSubmenuItemActive, isSubmenuGroupActive } from "@/lib/menu-active";
import { useCurrentHash } from "@/hooks/use-current-hash";

const FAST_PRINT_TAGS: Record<Locale, string> = {
  vi: "in nhanh",
  en: "fast",
  zh: "快印",
  ja: "特急",
  ko: "당일인쇄",
};

const DEFAULT_IMAGE = "/images/product/vd-item-decal.jpeg";

export function PackagingDesktopSubmenu({
  locale,
  isOpen,
  onItemClick,
}: Readonly<{
  locale: Locale;
  isOpen: boolean;
  onItemClick?: () => void;
}>) {
  const pathname = usePathname();
  const currentHash = useCurrentHash();
  const [bgImage, setBgImage] = useState<string>(DEFAULT_IMAGE);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    <div
      onMouseLeave={() => setHoveredId(null)}
      className={cn(
        "absolute top-full mt-1 w-[920px] xl:w-[980px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border border-white/50 p-6 xl:p-7 transition-all duration-200 z-50 text-zinc-800 overflow-hidden left-1/2 -translate-x-1/2",
        isOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-1"
      )}
    >
      {/* Layer 1: Background Image with smooth transition */}
      <Image
        src={bgImage}
        alt=""
        fill
        sizes="980px"
        className="object-cover -z-20 transition-all duration-300"
      />

      {/* Layer 2: Transparent Overlay matching reference image (pure white 70%, no blur) */}
      <div className="absolute inset-0 bg-white/70 -z-10" />

      {/* Layer 3: Menu 3-Column Content */}
      <div className="grid grid-cols-3 gap-8 relative z-10">
        {PACKAGING_SUBMENU_COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-6">
            {col.groups.map((group) => {
              const isGroupActive = isSubmenuGroupActive(group.href, pathname);
              return (
                <div key={group.id} className="flex flex-col">
                  <Link
                    href={group.href}
                    onClick={handleItemClick}
                    onMouseEnter={() => {
                      setBgImage(group.image);
                      setHoveredId(group.id);
                    }}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "group flex items-center justify-between pb-1.5 mb-2 border-b transition-colors",
                      isGroupActive || hoveredId === group.id
                        ? "border-brand-primary/50 text-brand-primary"
                        : "border-zinc-200/80 hover:border-brand-primary/40 text-zinc-900 hover:text-brand-primary"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[14.5px] font-bold tracking-tight transition-colors",
                        isGroupActive || hoveredId === group.id
                          ? "text-brand-primary"
                          : "text-zinc-900 group-hover:text-brand-primary"
                      )}
                    >
                      {pickLocale(
                        locale,
                        group.titleVi,
                        group.titleEn,
                        group.titleZh,
                        group.titleJa,
                        group.titleKo
                      )}
                    </span>
                  </Link>

                  <ul className="flex flex-col space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = isSubmenuItemActive(item.href, pathname, currentHash);
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={handleItemClick}
                            onMouseEnter={() => {
                              setBgImage(item.image);
                              setHoveredId(item.id);
                            }}
                            onMouseLeave={() => setHoveredId(null)}
                            className={cn(
                              "group flex items-center justify-between px-3 py-1.5 rounded-xl text-[13.5px] transition-all duration-150",
                              isActive
                                ? "bg-brand-primary/15 text-brand-primary font-bold ring-1 ring-brand-primary/30 shadow-2xs"
                                : hoveredId === item.id
                                  ? "bg-brand-primary/10 text-brand-primary font-bold shadow-2xs"
                                  : "text-zinc-800 hover:text-brand-primary hover:bg-brand-primary/10 font-medium"
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
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 text-[10px] font-bold rounded leading-none shadow-xs shrink-0 ml-1.5",
                                  isActive ? "bg-brand-primary text-white" : "bg-amber-500 text-white"
                                )}
                              >
                                {FAST_PRINT_TAGS[locale] || "in nhanh"}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
