"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WipeButton } from "@/components/ui/wipe-button";
import { cn } from "@/lib/utils";
import { productCategories, isFastPrint, getStartingPrice } from "@/data/categories";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

const linkHrefs = ["/products", "/blog", "/#services", "/#about", "/#cta"] as const;
const linkKeys = ["products", "blog", "services", "about", "contact"] as const;

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(productCategories[0].items[0]);
  const t = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

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
    setProductsOpen(false);
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
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <div className="hidden lg:flex items-center gap-1">
            {linkHrefs.map((href, i) => {
              const isProducts = href === "/products";
              if (isProducts) {
                return (
                  <div key={href} className="group relative py-2">
                    <Link
                      href={href}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-full inline-flex items-center gap-1 transition-colors duration-300",
                        transparent
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      )}
                    >
                      {t(`links.${linkKeys[i]}`)}
                    </Link>

                    {/* Desktop Mega Menu Dropdown (Sample Image 2 Style) */}
                    <div className="absolute top-full left-0 mt-1 w-[940px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-zinc-100 p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 text-zinc-800 flex gap-6">
                      {/* Left side: Dynamic Preview Card */}
                      <div className="w-64 shrink-0 bg-zinc-100/90 border border-zinc-200/60 rounded-2xl p-4 text-center flex flex-col items-center justify-between shadow-xs">
                        <div className="w-full">
                          <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 bg-white shadow-xs">
                            <Image
                              src={previewItem.image}
                              alt={pickLocale(locale, previewItem.nameVi, previewItem.nameEn)}
                              fill
                              sizes="256px"
                              className="object-cover"
                            />
                          </div>
                          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide leading-snug">
                            {pickLocale(locale, previewItem.nameVi, previewItem.nameEn)}
                          </h4>
                          <p className="text-[11px] text-zinc-500 italic mt-1 leading-relaxed line-clamp-2">
                            {pickLocale(locale, previewItem.descriptionVi, previewItem.description)}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 italic mt-2.5">
                          {getStartingPrice(previewItem.id, locale)}
                        </p>
                      </div>

                      {/* Right side: Multi-column Categories */}
                      <div className="grid grid-cols-4 gap-5 flex-1 pl-1">
                        {productCategories.map((cat) => (
                          <div key={cat.id} className="flex flex-col">
                            <Link
                              href={`/products#${cat.id}`}
                              className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2.5 pb-1 border-b border-zinc-100 hover:text-brand-dark transition-colors"
                            >
                              {pickLocale(locale, cat.nameVi, cat.nameEn)}
                            </Link>
                            <ul className="flex flex-col gap-1.5">
                              {cat.items.map((item) => {
                                const isHovered = previewItem.id === item.id;
                                return (
                                  <li key={item.id}>
                                    <Link
                                      href={`/products/${cat.id}/${item.id}`}
                                      onMouseEnter={() => setPreviewItem(item)}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 text-xs py-0.5 rounded transition-all",
                                        isHovered
                                          ? "text-emerald-700 font-bold translate-x-0.5"
                                          : "text-zinc-600 hover:text-emerald-700 hover:font-medium"
                                      )}
                                    >
                                      <span>{pickLocale(locale, item.nameVi, item.nameEn)}</span>
                                      {isFastPrint(item.id) && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-amber-500 rounded leading-none shadow-xs shrink-0">
                                          {locale === "vi" ? "in nhanh" : "fast"}
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
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300",
                    transparent
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  )}
                >
                  {t(`links.${linkKeys[i]}`)}
                </Link>
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
        <nav className="flex flex-col px-6 py-8 gap-1 flex-1 overflow-y-auto">
          {linkHrefs.map((href, i) => {
            const isProducts = href === "/products";
            if (isProducts) {
              return (
                <div key={href} className="flex flex-col">
                  <div className="flex items-center justify-between rounded-2xl hover:bg-zinc-50 transition-colors">
                    <Link
                      href={href}
                      onClick={closeAllMenu}
                      className="px-4 py-3.5 text-xl font-semibold text-zinc-800 flex-1"
                    >
                      {t(`links.${linkKeys[i]}`)}
                    </Link>
                    <button
                      onClick={() => setProductsOpen((o) => !o)}
                      aria-label="Toggle subcategories"
                      className="p-3.5 mr-1 text-zinc-600 hover:text-brand-primary transition-colors"
                    >
                      <ChevronDown
                        size={22}
                        className={cn("transition-transform duration-200", productsOpen && "rotate-180")}
                      />
                    </button>
                  </div>

                  {/* Mobile Accordion Subcategories */}
                  {productsOpen && (
                    <div className="pl-6 pr-4 py-2 flex flex-col gap-4 border-l-2 border-brand-primary/20 ml-4 my-1">
                      {productCategories.map((cat) => (
                        <div key={cat.id} className="flex flex-col gap-1.5">
                          <Link
                            href={`/products#${cat.id}`}
                            onClick={closeAllMenu}
                            className="text-xs font-bold uppercase tracking-wider text-brand-primary"
                          >
                            {pickLocale(locale, cat.nameVi, cat.nameEn)}
                          </Link>
                          <ul className="flex flex-col gap-1 pl-2">
                            {cat.items.map((item) => (
                              <li key={item.id}>
                                <Link
                                  href={`/products/${cat.id}/${item.id}`}
                                  onClick={closeAllMenu}
                                  className="block py-1.5 text-sm font-medium text-zinc-700 hover:text-brand-primary"
                                >
                                  {pickLocale(locale, item.nameVi, item.nameEn)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={closeAllMenu}
                className="px-4 py-3.5 text-xl font-semibold text-zinc-800 rounded-2xl hover:bg-zinc-50 transition-colors"
              >
                {t(`links.${linkKeys[i]}`)}
              </Link>
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
