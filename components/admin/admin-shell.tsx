"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, LogOut, Menu, Printer, ShieldCheck, X } from "lucide-react";
import { buildNav, isNavItemActive } from "@/components/admin/admin-nav";
import { ThemeToggle, useAdminTheme } from "@/components/admin/admin-theme";
import { ACCOUNT_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin-access";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/dal";
import { roleLabel } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  /** Already authenticated by the server layout (lib/dal.ts) — the shell never decides access itself. */
  user: Pick<SessionUser, "name" | "email" | "role">;
  showLegacyEditors: boolean;
  children: React.ReactNode;
};

export function AdminShell({ user, showLegacyEditors, children }: Readonly<AdminShellProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useAdminTheme();

  const sections = buildNav(user.role, showLegacyEditors);
  const currentLabel = sections.flatMap((section) => section.items).find((item) => isNavItemActive(pathname, item.href))?.label;

  const handleLogout = async () => {
    await authClient.signOut().catch(() => undefined);
    router.replace(ADMIN_LOGIN_PATH);
  };

  return (
    // Colours come from `dark:` variants, not from `theme` state: the inline script in app/admin/layout.tsx
    // puts `dark` on <html> before the first paint, so a full page load never flashes the light theme.
    <div className="admin-theme-root flex min-h-screen bg-[#f4f6fb] font-sans text-slate-900 transition-colors duration-200 dark:bg-[#080526] dark:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - Viet Dragon Deep Navy */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#09052f] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6 bg-[#060322]">
          <Link href={ACCOUNT_PATH} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary via-purple-500 to-pink-500 text-white shadow-lg shadow-brand-primary/40">
              <Printer size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  VIET <span className="text-pink-400">DRAGON</span>
                </span>
                <span className="rounded bg-brand-primary/30 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-brand-primary/40">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Hệ Thống Quản Trị In Ấn</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng menu"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-6 px-4 py-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{section.title}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-lg shadow-brand-primary/30 font-bold"
                        : "text-zinc-300 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                        isActive ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white",
                      )}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div className="flex-1">
                      <div className="leading-tight">{item.label}</div>
                      <div className={cn("text-[10px] mt-0.5 font-normal", isActive ? "text-purple-200" : "text-zinc-400")}>{item.subtitle}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Action Footer */}
        <div className="border-t border-white/10 bg-[#060322] p-4">
          <Link
            href={ACCOUNT_PATH}
            onClick={() => setSidebarOpen(false)}
            className="mb-3 flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{user.name}</p>
              <p className="truncate text-[10px] font-medium text-emerald-400">{roleLabel(user.role)}</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/20 hover:text-white"
            >
              <ExternalLink size={12} /> Xem Web
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25 cursor-pointer"
            >
              <LogOut size={12} /> Thoát
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs lg:h-20 lg:px-10 dark:bg-[#060322] dark:border-white/10 dark:text-white transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium text-slate-500 sm:flex dark:text-zinc-400">
              <Link href={ACCOUNT_PATH} className="hover:text-brand-primary transition-colors">
                Admin
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="font-bold text-slate-800 dark:text-white">{currentLabel ?? "Quản trị"}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-100 px-3 py-1.5 text-xs text-purple-700 font-semibold dark:bg-brand-primary/20 dark:border-brand-primary/30 dark:text-purple-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Xưởng In & Showroom: <strong>TP. Hồ Chí Minh, Đồng Nai, Vũng Tàu & Bình Dương</strong>
              </span>
            </div>

            <ThemeToggle theme={theme} onChange={setTheme} />

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-[#09052f] px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-primary transition-colors shadow-sm dark:bg-brand-primary dark:hover:bg-brand-primary/80"
            >
              <span>Xem Web Khách Hàng</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6fb] p-6 transition-colors duration-200 lg:p-10 dark:bg-[#080526]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
