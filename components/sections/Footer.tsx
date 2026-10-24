"use client";

import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconBadge } from "@/components/ui/icon-badge";
import { useSiteData } from "@/components/providers/site-data-provider";
import { cn } from "@/lib/utils";

type CompanyLink = { href: string; ns: "nav" | "footer"; key: string };
const companyLinks: CompanyLink[] = [
  { href: "/#about", ns: "nav", key: "about" },
  { href: "/#services", ns: "footer", key: "services" },
  { href: "/#process", ns: "footer", key: "process" },
  { href: "/#testimonials", ns: "footer", key: "testimonials" },
  { href: "/#faq", ns: "footer", key: "faq" },
  { href: "/blog", ns: "nav", key: "blog" }
];

// lucide-react dropped brand/social marks — minimal inline glyphs instead.
function FacebookIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8.5H16l.5-3.5h-3V6.8c0-1 .3-1.7 1.7-1.7H16.5V1.4C16.2 1.3 15.2 1.2 14 1.2c-2.5 0-4.2 1.5-4.2 4.3V9H7.3v3.5h2.5V21h3.7z" />
    </svg>
  );
}
function InstagramIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9 1.3-.1 1.6-.1 4.9-.1zm0-2.2C8.7 0 8.3 0 7 .1 2.7.3.3 2.7.1 7 0 8.3 0 8.7 0 12s0 3.7.1 5c.2 4.3 2.6 6.7 6.9 6.9 1.3.1 1.7.1 5 .1s3.7 0 5-.1c4.3-.2 6.7-2.6 6.9-6.9.1-1.3.1-1.7.1-5s0-3.7-.1-5C23.7 2.7 21.3.3 17 .1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
    </svg>
  );
}
function YoutubeIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8 0 12 0 12s0 4 .5 5.8c.3 1 1 1.8 2 2.1 1.8.6 9.5.6 9.5.6s7.7 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5V8.5l6.4 3.5-6.4 3.5z" />
    </svg>
  );
}

// Placeholder social hrefs — swap for real profile URLs once they exist.
const socialLinks = [
  { icon: FacebookIcon, href: "https://facebook.com", name: "Facebook" },
  { icon: InstagramIcon, href: "https://instagram.com", name: "Instagram" },
  { icon: YoutubeIcon, href: "https://youtube.com", name: "YouTube" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const { categories } = useSiteData();
  const pathname = usePathname();

  return (
    <footer className="relative bg-brand-soft text-brand-dark border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-icon.webp"
                alt="Viet Dragon - In Ấn Chuyên Nghiệp"
                width={56}
                height={44}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
              />
              <div>
                <p className="text-2xl font-black tracking-tight leading-none">
                  VIET <span className="text-brand-primary">DRAGON</span>
                </p>
                <p className="text-[11px] font-semibold text-brand-dark/50 tracking-wider uppercase mt-1">
                  Hơn cả một đối tác
                </p>
              </div>
            </div>
            <p className="text-brand-dark/70 text-sm leading-relaxed mb-5">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-brand-dark hover:bg-brand-primary hover:text-white transition-colors shadow-xs"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Products — the categories of the content database */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/50 mb-4">
              {t("productsLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              <li key="all-products">
                <Link
                  href="/products"
                  className={cn(
                    "inline-block text-sm py-1 transition-all duration-200",
                    pathname === "/products"
                      ? "text-brand-primary font-bold"
                      : "text-brand-dark/70 hover:text-brand-primary hover:translate-x-1 font-medium"
                  )}
                >
                  {t("allProducts")}
                </Link>
              </li>
              {categories.map((cat) => {
                const isActive = pathname === cat.href || pathname.startsWith(`${cat.href}/`);
                return (
                  <li key={cat.id}>
                    <Link
                      href={cat.href}
                      className={cn(
                        "inline-block text-sm py-1 transition-all duration-200",
                        isActive
                          ? "text-brand-primary font-bold"
                          : "text-brand-dark/70 hover:text-brand-primary hover:translate-x-1 font-medium"
                      )}
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/50 mb-4">
              {t("companyLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map((link) => {
                const isActive = link.href === "/blog" && pathname.startsWith("/blog");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "inline-block text-sm py-1 transition-all duration-200",
                        isActive
                          ? "text-brand-primary font-bold"
                          : "text-brand-dark/70 hover:text-brand-primary hover:translate-x-1 font-medium"
                      )}
                    >
                      {link.ns === "nav" ? tNav(`links.${link.key}`) : t(`usefulLinks.${link.key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/50 mb-4">
              {t("contactLabel")}
            </p>
            <ul className="flex flex-col gap-4 text-sm text-brand-dark/70">
              <li className="flex items-center gap-3">
                <IconBadge icon={Phone} size="md" />
                <span className="flex flex-col">
                  <a href="tel:0901448377" className="hover:text-brand-primary transition-colors font-medium">{tContact("phone1")}</a>
                  <a href="tel:0919510543" className="hover:text-brand-primary transition-colors font-medium">{tContact("phone2")}</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={Mail} size="md" />
                <a href="mailto:contact@vietdragon.vn" className="hover:text-brand-primary transition-colors font-medium">
                  {tContact("email")}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={MapPin} size="md" />
                <span className="leading-relaxed font-medium">
                  {tContact("address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-dark/50">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="hidden sm:block text-[11px] tracking-wider uppercase text-brand-dark/40 font-medium">
            Viet Dragon Printing Co., Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
