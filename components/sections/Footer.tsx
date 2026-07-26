"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";
import { productCategories } from "@/data/categories";
import { IconBadge } from "@/components/ui/icon-badge";

const usefulLinkHrefs = ["/#about", "/#services", "/#process", "/#testimonials", "/#faq"] as const;
const usefulLinkKeys = ["about", "services", "process", "testimonials", "faq"] as const;

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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YoutubeIcon({ size = 15 }: Readonly<{ size?: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Placeholder social hrefs — swap for real profile URLs once they exist.
const socialLinks = [FacebookIcon, InstagramIcon, YoutubeIcon];

export default function Footer() {
  const t = useTranslations("footer");
  const tContact = useTranslations("contact");
  const locale = useLocale() as Locale;

  return (
    <footer className="bg-brand-soft text-brand-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="text-2xl font-black tracking-tight mb-4">
              VIET <span className="text-brand-primary">DRAGON</span>
            </p>
            <p className="text-brand-dark/60 text-sm leading-relaxed mb-5">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((Icon) => (
                <a
                  key={Icon.name}
                  href="#"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-brand-dark hover:bg-brand-primary hover:text-white transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Products — categories from data */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("productsLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              {productCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href="/products"
                    className="text-sm text-brand-dark/60 hover:text-brand-primary transition-colors"
                  >
                    {pickLocale(locale, cat.nameVi, cat.nameEn)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("usefulLabel")}
            </p>
            <ul className="flex flex-col gap-2">
              {usefulLinkHrefs.map((href, i) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-brand-dark/60 hover:text-brand-primary transition-colors"
                  >
                    {t(`usefulLinks.${usefulLinkKeys[i]}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark/40 mb-4">
              {t("contactLabel")}
            </p>
            <ul className="flex flex-col gap-4 text-sm text-brand-dark/60">
              <li className="flex items-center gap-3">
                <IconBadge icon={Phone} size="md" />
                <span className="flex flex-col">
                  <a href="tel:0901448377" className="hover:text-brand-primary transition-colors">{tContact("phone1")}</a>
                  <a href="tel:0919510543" className="hover:text-brand-primary transition-colors">{tContact("phone2")}</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={Mail} size="md" />
                <a href="mailto:contact@vietdragon.vn" className="hover:text-brand-primary transition-colors">
                  {tContact("email")}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconBadge icon={MapPin} size="md" />
                <span className="leading-relaxed">
                  {tContact("address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex items-center justify-center text-xs text-brand-dark/40">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
