"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Sản Phẩm", href: "/products" },
  { label: "Bài Viết", href: "/blog" },
  { label: "Dịch Vụ", href: "/#services" },
  { label: "Giới Thiệu", href: "/#vision" },
  { label: "Liên Hệ", href: "/#cta" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled || menuOpen
            ? "bg-white/95 backdrop-blur-sm border-b border-zinc-100 shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-zinc-900"
            onClick={() => setMenuOpen(false)}
          >
            VIET <span className="text-brand-red">DRAGON</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#cta"
              className="hidden lg:inline-flex items-center px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Nhận báo giá
            </Link>

            {/* Hamburger — mobile & tablet */}
            <button
              className="lg:hidden p-2 -mr-1 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white pt-16 lg:hidden flex flex-col transition-opacity duration-200",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col px-6 py-8 gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3.5 text-xl font-semibold text-zinc-800 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="px-6 pb-10">
          <Link
            href="/#cta"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-full px-6 py-4 bg-brand-red text-white text-base font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            Nhận Báo Giá
          </Link>
          <p className="text-center text-zinc-400 text-xs mt-4">
            📞 0901 448 377 · contact@vietdragon.vn
          </p>
        </div>
      </div>
    </>
  );
}
