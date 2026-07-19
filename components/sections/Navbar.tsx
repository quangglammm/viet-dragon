"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WipeButton } from "@/components/ui/wipe-button";
import { cn } from "@/lib/utils";

const linkHrefs = ["/products", "/blog", "/#services", "/#about", "/#cta"] as const;
const linkKeys = ["products", "blog", "services", "about", "contact"] as const;

function LocaleSwitcher({
  locale,
  onSwitch,
  className,
}: {
  locale: string;
  onSwitch: (next: "vi" | "en") => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        onClick={() => onSwitch("vi")}
        aria-label="Tiếng Việt"
        className={cn("text-lg leading-none transition-opacity", locale === "vi" ? "opacity-100" : "opacity-40 hover:opacity-70")}
      >
        🇻🇳
      </button>
      <button
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
  const t = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale();
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
  const handleBrandClick = () => {
    setMenuOpen(false);
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
            {linkHrefs.map((href, i) => (
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
            ))}
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
        <nav className="flex flex-col px-6 py-8 gap-1 flex-1">
          {linkHrefs.map((href, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3.5 text-xl font-semibold text-zinc-800 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              {t(`links.${linkKeys[i]}`)}
            </Link>
          ))}
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
