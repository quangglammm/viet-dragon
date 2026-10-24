"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavMenu } from "@/lib/content/read/navigation";
import { isSubmenuItemActive } from "@/lib/menu-active";
import { useCurrentHash } from "@/hooks/use-current-hash";
import { navigateToShapeHash } from "@/lib/hash-navigation";
import { cn } from "@/lib/utils";

export function MegaMenuMobile({
  menu,
  onItemClick,
}: Readonly<{
  menu: NavMenu;
  onItemClick?: () => void;
}>) {
  const t = useTranslations("nav");
  const fastTag = t("fastPrintTag");
  const pathname = usePathname();
  const currentHash = useCurrentHash();
  const allGroups = menu.columns.flatMap((col) => col.groups);

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    navigateToShapeHash(href, e);
    onItemClick?.();
  };

  return (
    <div className="pl-4 pr-2 py-2 flex flex-col gap-4 border-l-2 border-brand-primary/30 ml-4 my-1">
      {allGroups.map((group) => (
        <div key={group.id} className="flex flex-col">
          <Link
            href={group.href}
            onClick={(e) => handleLinkClick(group.href, e)}
            className="text-[14px] font-bold text-brand-primary mb-1.5 pb-0.5 border-b border-brand-primary/20 inline-block"
          >
            {group.title}
          </Link>
          <ul className="flex flex-col gap-1 pl-1">
            {group.items.map((item) => {
              const isActive = isSubmenuItemActive(item.href, pathname, currentHash);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(item.href, e)}
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-sm transition-all",
                      isActive
                        ? "text-brand-primary font-bold bg-brand-soft/90 shadow-2xs"
                        : "text-zinc-700 hover:text-brand-primary hover:bg-zinc-50/50"
                    )}
                  >
                    <span className="leading-snug">{item.label}</span>
                    {item.isFast && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#f5a623] rounded leading-none shrink-0 ml-1.5">
                        {fastTag}
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
