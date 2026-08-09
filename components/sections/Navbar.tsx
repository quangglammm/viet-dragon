"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, Phone, Mail, MapPin, ChevronDown, Briefcase, Package, Calendar, Gift, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = { Briefcase, Package, Calendar, Gift };
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WipeButton } from "@/components/ui/wipe-button";
import { cn } from "@/lib/utils";
import { productCategories, isFastPrint, type ProductCategory, type ProductItem } from "@/data/categories";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";



function LocaleSwitcher({
  locale,
  onSwitch,
  className,
}: Readonly<{
  locale: string;
  onSwitch: (next: "vi" | "en") => void;
  className?: string;
}>) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onSwitch("vi")}
        aria-label="Tiếng Việt"
        className={cn("text-lg leading-none transition-opacity", locale === "vi" ? "opacity-100" : "opacity-40 hover:opacity-70")}
      >
        🇻🇳
      </button>
      <span className="text-zinc-300 text-xs">/</span>
      <button
        type="button"
        onClick={() => onSwitch("en")}
        aria-label="English"
        className={cn("text-lg leading-none transition-opacity", locale === "en" ? "opacity-100" : "opacity-40 hover:opacity-70")}
      >
        🇬🇧
      </button>
    </div>
  );
}

function DesktopCategoryDropdown({
  cat,
  locale,
  isOpen,
}: Readonly<{
  cat: ProductCategory;
  locale: Locale;
  isOpen: boolean;
}>) {
  const pathname = usePathname();
  const [previewItem, setPreviewItem] = useState<ProductItem>(() => {
    return cat.items.find((i) => pathname === `/products/${cat.id}/${i.id}`) || cat.items[0];
  });

  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[600px] bg-white rounded-2xl shadow-2xl border border-zinc-100 p-4 transition-all duration-200 z-50 flex gap-5 text-zinc-800",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      {/* Left side: Preview card */}
      <div className="w-1/2 bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center flex flex-col items-center justify-start shadow-sm">
        <div className="w-full">
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 bg-white shadow-xs">
            <Image
              src={previewItem.image}
              alt={pickLocale(locale, previewItem.nameVi, previewItem.nameEn)}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
          <h4 className="text-[13px] font-bold text-brand-primary uppercase tracking-wide leading-snug">
            {pickLocale(locale, previewItem.nameVi, previewItem.nameEn)}
          </h4>
          <p className="text-[12px] text-zinc-500 italic mt-1.5 leading-relaxed line-clamp-2">
            {pickLocale(locale, previewItem.descriptionVi, previewItem.description)}
          </p>
        </div>
      </div>

      {/* Right side: List of items */}
      <div className="w-1/2 flex flex-col gap-1">
        {cat.items.map((item) => {
          const isActive = pathname === `/products/${cat.id}/${item.id}`;
          const isHovered = previewItem.id === item.id;
          return (
            <Link
              key={item.id}
              href={`/products/${cat.id}/${item.id}`}
              onMouseEnter={() => setPreviewItem(item)}
              className={cn(
                "px-3 py-2.5 text-[14px] font-medium rounded-lg transition-colors flex items-center justify-between",
                (isHovered || isActive)
                  ? "bg-brand-soft text-brand-primary"
                  : "text-zinc-600 hover:text-brand-primary hover:bg-zinc-50"
              )}
            >
              <span className={cn(isActive && "font-bold")}>{pickLocale(locale, item.nameVi, item.nameEn)}</span>
              {isFastPrint(item.id) && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-amber-500 rounded leading-none shadow-xs shrink-0 ml-2">
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

  const switchLocale = (next: "vi" | "en") => {
    router.replace(pathname, { locale: next });
  };

  // Clicking the logo while already on "/" is a no-op for Next's router (same
  // URL, no navigation fires), so it would otherwise do nothing when scrolled
  // down — scroll to top explicitly in that case.
  const closeAllMenu = () => {
    setMenuOpen(false);
    setOpenMobileCat(null);
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
            <div className="flex items-center gap-6">
              <a href="tel:0901448377" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={13} /> {tContact("phone1")}
              </a>
              <LocaleSwitcher locale={locale} onSwitch={switchLocale} />
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
          <div className="hidden lg:flex items-center justify-center flex-1 gap-4 xl:gap-8 px-4">
            {productCategories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Briefcase;
              const isActiveCat = pathname.startsWith(`/products/${cat.id}`);
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
                      "flex items-center gap-1.5 py-2 text-[13px] xl:text-sm font-bold uppercase tracking-wider transition-colors duration-300",
                      transparent
                        ? "text-white/90 hover:text-white"
                        : "text-zinc-800 hover:text-brand-primary",
                      (activeDesktopCat === cat.id || isActiveCat) && !transparent && "text-brand-primary",
                      (activeDesktopCat === cat.id || isActiveCat) && transparent && "text-white"
                    )}
                  >
                    <Icon size={14} strokeWidth={2.5} />
                    {pickLocale(locale, cat.nameVi, cat.nameEn)}
                  </Link>

                  <DesktopCategoryDropdown cat={cat} locale={locale} isOpen={activeDesktopCat === cat.id} />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
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

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white pt-16 lg:hidden flex flex-col transition-opacity duration-200",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col px-6 py-8 gap-2 flex-1 overflow-y-auto">
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
          <LocaleSwitcher locale={locale} onSwitch={switchLocale} className="justify-center mb-5" />
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
