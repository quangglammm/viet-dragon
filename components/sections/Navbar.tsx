"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, Phone, Mail, MapPin, ChevronDown, Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift, User, Layers, Zap, Sparkles };
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WipeButton } from "@/components/ui/wipe-button";
import { cn } from "@/lib/utils";
import { productCategories, isFastPrint, type ProductCategory, type ProductItem } from "@/data/categories";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

const LANGUAGES: { code: Locale; flag: string; label: string; short: string }[] = [
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt", short: "VN" },
  { code: "en", flag: "🇬🇧", label: "English", short: "EN" },
  { code: "zh", flag: "🇨🇳", label: "中文", short: "ZH" },
  { code: "ja", flag: "🇯🇵", label: "日本語", short: "JA" },
  { code: "ko", flag: "🇰🇷", label: "한국어", short: "KO" },
];

/**
 * Floating Language Switcher rendered directly beneath the menu.
 * 2 states:
 * - "khuất" (compact): shows language vn-arrow pill
 * - "full" (expanded): opens the full language list
 */
function FloatingLocaleSwitcher({
  locale = "vi",
  onSwitch,
  variant = "floating",
  className,
}: Readonly<{
  locale: Locale;
  onSwitch: (next: Locale) => void;
  variant?: "floating" | "topbar";
  className?: string;
}>) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isTopbar = variant === "topbar";

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left select-none", className)}>
      {/* Trạng thái 1: Khuất (Chỉ có lá cờ và mũi tên) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "group flex items-center gap-1 rounded-full transition-all duration-200 cursor-pointer",
          isTopbar
            ? "px-2 py-0.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-2xs backdrop-blur-xs"
            : "gap-1.5 px-2.5 py-1.5 bg-white/95 hover:bg-white border border-zinc-200/90 shadow-md hover:shadow-lg backdrop-blur-md",
          open && isTopbar && "bg-white/30 border-white/40 ring-2 ring-white/30",
          open && !isTopbar && "ring-2 ring-brand-primary/30 border-brand-primary/50 bg-white shadow-lg"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Chọn ngôn ngữ"
        title={currentLang.label}
      >
        <span className={cn("leading-none select-none", isTopbar ? "text-sm" : "text-base")}>
          {currentLang.flag}
        </span>
        <ChevronDown
          size={isTopbar ? 11 : 13}
          strokeWidth={2.5}
          className={cn(
            "transition-transform duration-200 shrink-0",
            isTopbar
              ? "text-white/70 group-hover:text-white"
              : "text-zinc-400 group-hover:text-zinc-700",
            open && (isTopbar ? "rotate-180 text-white" : "rotate-180 text-brand-primary")
          )}
        />
      </button>

      {/* Trạng thái 2: Full (Chỉ hiển thị các lá cờ) */}
      {open && (
        <div
          className={cn(
            "absolute mt-1.5 rounded-2xl bg-white/98 backdrop-blur-md border border-zinc-100 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 min-w-[42px]",
            isTopbar ? "left-0 sm:right-0 sm:left-auto" : "right-0"
          )}
          role="listbox"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = (locale || "vi") === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSwitch(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-center size-8.5 rounded-xl text-lg leading-none transition-all cursor-pointer",
                  isSelected
                    ? "bg-brand-soft ring-1.5 ring-brand-primary shadow-2xs scale-105"
                    : "hover:bg-zinc-100 hover:scale-105 opacity-70 hover:opacity-100"
                )}
                role="option"
                aria-selected={isSelected}
                title={lang.label}
              >
                <span>{lang.flag}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DrawerLocaleSwitcher({
  locale = "vi",
  onSwitch,
  className,
}: Readonly<{
  locale: Locale;
  onSwitch: (next: Locale) => void;
  className?: string;
}>) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2", className)}>
      {LANGUAGES.map((lang) => {
        const isSelected = (locale || "vi") === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSwitch(lang.code)}
            className={cn(
              "flex items-center justify-center size-10 rounded-2xl text-2xl leading-none transition-all cursor-pointer",
              isSelected
                ? "bg-brand-soft ring-2 ring-brand-primary shadow-xs scale-110"
                : "bg-zinc-100 hover:bg-zinc-200 opacity-60 hover:opacity-100"
            )}
            title={lang.label}
          >
            <span>{lang.flag}</span>
          </button>
        );
      })}
    </div>
  );
}

function DesktopCategoryDropdown({
  cat,
  locale,
  isOpen,
  align = "center",
}: Readonly<{
  cat: ProductCategory;
  locale: Locale;
  isOpen: boolean;
  align?: "left" | "center" | "right";
}>) {
  const pathname = usePathname();
  const [previewItem, setPreviewItem] = useState<ProductItem | null>(() => {
    if (cat.items.length === 0) return null;
    return cat.items.find((i) => pathname === `/products/${cat.id}/${i.id}`) ?? cat.items[0];
  });

  const itemCount = cat.items.length;
  const isMultiCol = itemCount > 5;
  const widthClass = isMultiCol ? "w-[560px]" : "w-[400px]";
  const alignClass =
    align === "left"
      ? "left-0 translate-x-0"
      : align === "right"
      ? "right-0 left-auto translate-x-0"
      : "left-1/2 -translate-x-1/2";

  // No items (e.g. fast-print has its own dedicated page)
  if (cat.items.length === 0 || previewItem === null) return null;

  return (
    <div className={cn(
      "absolute top-full mt-1 rounded-2xl shadow-2xl border border-white/50 overflow-hidden transition-all duration-200 z-50 text-zinc-800 min-h-[350px] flex flex-col justify-center",
      widthClass,
      alignClass,
      isOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
    )}>
      {/* Layer 1: Background Image */}
      <Image
        src={previewItem.image}
        alt=""
        fill
        sizes={isMultiCol ? "560px" : "400px"}
        className="object-cover -z-20 transition-opacity duration-300"
      />
      
      {/* Layer 2: Transparent Overlay */}
      <div className="absolute inset-0 bg-white/70 -z-10" />

      {/* Layer 3: Menu Items */}
      <div className={cn(
        "relative z-10 p-6",
        isMultiCol ? "grid grid-cols-2 gap-x-6 gap-y-1" : "flex flex-col gap-1"
      )}>
        {cat.items.map((item) => {
          const isActive = pathname === `/products/${cat.id}/${item.id}`;
          return (
            <Link
              key={item.id}
              href={`/products/${cat.id}/${item.id}`}
              onMouseEnter={() => setPreviewItem(item)}
              className={cn(
                "px-4 py-3 text-[14px] font-medium rounded-lg transition-colors flex items-center justify-between gap-2",
                isActive
                  ? "bg-brand-primary/10 text-brand-primary font-bold"
                  : "text-zinc-800 hover:text-brand-primary hover:bg-brand-primary/10"
              )}
            >
              <span className={cn(isActive && "font-bold", isMultiCol && "truncate")}>{pickLocale(locale, item.nameVi, item.nameEn)}</span>
              {isFastPrint(item.id) && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-500 rounded leading-none shadow-xs shrink-0">
                  {locale === "vi" ? "in nhanh" : "fast"}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMobileCat, setOpenMobileCat] = useState<string | null>(null);
  const [activeDesktopCat, setActiveDesktopCat] = useState<string | null>(null);
  const catTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleCatMouseEnter = (catId: string) => {
    if (catTimeoutRef.current) {
      clearTimeout(catTimeoutRef.current);
      catTimeoutRef.current = null;
    }
    setActiveDesktopCat(catId);
  };

  const handleCatMouseLeave = () => {
    catTimeoutRef.current = setTimeout(() => {
      setActiveDesktopCat(null);
    }, 500);
  };

  // Template's header-1.style-3 sits transparent/white-text over the hero and only
  // turns solid on scroll — only the homepage has a hero behind it to be transparent
  // over, so inner pages (Products/Blog) always render the solid nav.
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const switchLocale = (next: Locale) => {
    router.replace(pathname, { locale: next });
  };

  // Clicking the logo while already on "/" is a no-op for Next's router (same
  // URL, no navigation fires), so it would otherwise do nothing when scrolled
  // down — scroll to top explicitly in that case.
  const closeAllMenu = () => {
    setMenuOpen(false);
  };

  const handleBrandClick = () => {
    closeAllMenu();
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        {/* Top info bar — desktop only, permanent brand-gradient band (matches the
            template's header-top-section, which sits outside the sticky-toggled
            element and never changes with scroll). Height is constant so page
            content padding-top never has to change and never overlaps it. */}
        <div className="hidden lg:block text-white" style={{ background: "var(--gradient-brand)" }}>
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between text-xs text-white/80">
            <ul className="flex items-center gap-6">
              <li className="flex items-center gap-2">
                <Mail size={13} /> {tContact("email")}
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} /> {tContact("address")}
              </li>
            </ul>
            <div className="flex items-center gap-4">
              <FloatingLocaleSwitcher variant="topbar" locale={locale} onSwitch={switchLocale} />
              <span className="w-px h-3.5 bg-white/25" aria-hidden="true" />
              <a href="tel:0901448377" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={13} /> {tContact("phone1")}
              </a>
            </div>
          </div>
        </div>

        {/* Main nav row — transparent with white text over the homepage hero,
            solid white with a shadow once scrolled (or on any non-home page,
            which has no dark hero behind it to be transparent over). */}
        <div
          className={cn(
            "transition-colors duration-300",
            transparent
              ? "bg-transparent border-b border-transparent"
              : "bg-white border-b border-zinc-100 shadow-sm"
          )}
        >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          <Link
            href="/"
            className={cn(
              "text-xl font-black tracking-tight transition-colors duration-300",
              transparent ? "text-white" : "text-zinc-900"
            )}
            onClick={handleBrandClick}
          >
            VIET <span className={transparent ? "text-white/80" : "text-brand-primary"}>DRAGON</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-1.5 xl:gap-3 2xl:gap-5 px-2 xl:px-4">
            {productCategories.map((cat, idx) => {
              const Icon = iconMap[cat.icon] ?? Briefcase;
              const isActiveCat = pathname.startsWith(`/products/${cat.id}`);
              const align = idx === 0 ? "left" : idx >= productCategories.length - 2 ? "right" : "center";
              return (
                <div
                  key={cat.id}
                  className="py-2 relative"
                  onMouseEnter={() => handleCatMouseEnter(cat.id)}
                  onMouseLeave={handleCatMouseLeave}
                >
                  <Link
                    href={`/products/${cat.id}`}
                    className={cn(
                      "flex items-center gap-1 xl:gap-1.5 py-2 text-[11px] xl:text-[13px] 2xl:text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors duration-300",
                      transparent
                        ? "text-white/90 hover:text-white"
                        : "text-zinc-800 hover:text-brand-primary",
                      (activeDesktopCat === cat.id || isActiveCat) && !transparent && "text-brand-primary",
                      (activeDesktopCat === cat.id || isActiveCat) && transparent && "text-white"
                    )}
                  >
                    <Icon size={13} className="shrink-0" strokeWidth={2.5} />
                    <span>{pickLocale(locale, cat.nameVi, cat.nameEn)}</span>
                  </Link>

                  <DesktopCategoryDropdown cat={cat} locale={locale} isOpen={activeDesktopCat === cat.id} align={align} />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <WipeButton
              href="/#cta"
              tone="primary"
              size="sm"
              arrow={false}
              className={cn(
                "hidden lg:inline-flex transition-colors duration-300",
                transparent && "bg-white text-brand-primary"
              )}
            >
              {t("quote")}
            </WipeButton>

            {/* Hamburger — mobile & tablet */}
            <button
              className={cn(
                "lg:hidden p-2 -mr-1 rounded-lg transition-colors duration-300",
                transparent ? "text-white hover:bg-white/10" : "text-zinc-700 hover:bg-zinc-100"
              )}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
        </div>
      </header>

      {/* Language switcher directly under menu on mobile & tablet — does NOT follow scroll */}
      {!menuOpen && (
        <div
          className={cn(
            "absolute top-[72px] right-4 sm:right-6 z-40 lg:hidden transition-all duration-200",
            scrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100 pointer-events-auto"
          )}
        >
          <FloatingLocaleSwitcher locale={locale} onSwitch={switchLocale} />
        </div>
      )}

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white pt-16 lg:hidden flex flex-col transition-opacity duration-200",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="px-6 pt-4 pb-2 border-b border-zinc-100">
          <DrawerLocaleSwitcher locale={locale} onSwitch={switchLocale} className="w-full" />
        </div>
        <nav className="flex flex-col px-6 py-6 gap-2 flex-1 overflow-y-auto">
          {productCategories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Briefcase;
            const isActiveCat = pathname.startsWith(`/products/${cat.id}`);
            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex items-center justify-between rounded-2xl hover:bg-zinc-50 transition-colors">
                  <Link
                    href={`/products/${cat.id}`}
                    onClick={closeAllMenu}
                    className={cn(
                      "flex items-center gap-2.5 pl-4 py-3.5 text-xl font-semibold flex-1 transition-colors",
                      isActiveCat ? "text-brand-primary" : "text-zinc-800"
                    )}
                  >
                    <Icon size={22} className={isActiveCat ? "text-brand-primary" : "text-brand-primary/80"} />
                    {pickLocale(locale, cat.nameVi, cat.nameEn)}
                  </Link>
                <button
                  onClick={() => setOpenMobileCat((current) => current === cat.id ? null : cat.id)}
                  aria-label="Toggle subcategories"
                  className="p-4 -mr-2 text-zinc-600 hover:text-brand-primary transition-colors"
                >
                  <ChevronDown
                    size={22}
                    className={cn("transition-transform duration-200", openMobileCat === cat.id && "rotate-180")}
                  />
                </button>
              </div>

              {/* Mobile Accordion Subcategories */}
              {openMobileCat === cat.id && (
                <div className="pl-6 pr-4 py-2 flex flex-col gap-2 border-l-2 border-brand-primary/20 ml-4 my-1">
                  <ul className="flex flex-col gap-1">
                    {cat.items.map((item) => {
                      const isActive = pathname === `/products/${cat.id}/${item.id}`;
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/products/${cat.id}/${item.id}`}
                            onClick={closeAllMenu}
                            className={cn(
                              "block py-2 text-base font-medium transition-colors hover:text-brand-primary",
                              isActive ? "text-brand-primary font-bold" : "text-zinc-700"
                            )}
                          >
                            {pickLocale(locale, item.nameVi, item.nameEn)}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        </nav>

        <div className="px-6 pb-10">
          <WipeButton
            href="/#cta"
            tone="primary"
            size="lg"
            arrow={false}
            className="w-full"
            onClick={() => setMenuOpen(false)}
          >
            {t("quote")}
          </WipeButton>
          <p className="flex items-center justify-center gap-1.5 text-center text-zinc-400 text-xs mt-4">
            <Phone size={13} /> {tContact("phone1")} · <Mail size={13} /> {tContact("email")}
          </p>
        </div>
      </div>
    </>
  );
}
