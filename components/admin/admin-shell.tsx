"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Languages,
  Package,
  FileText,
  Image as ImageIcon,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Printer,
  Bell,
  ChevronRight,
  ShieldCheck,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Bàn Làm Việc",
    subtitle: "Số liệu, biểu đồ & báo giá",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/site-content",
    label: "Quản Lý Giao Diện & Ảnh",
    subtitle: "Sửa tất cả chữ & ảnh website",
    icon: LayoutTemplate,
  },
  {
    href: "/admin/products",
    label: "Sản Phẩm & Quy Cách In",
    subtitle: "20 sản phẩm · 8 danh mục",
    icon: Package,
  },
  {
    href: "/admin/translations",
    label: "Bản Dịch 5 Ngôn Ngữ",
    subtitle: "VI · EN · ZH · JA · KO",
    icon: Languages,
  },
  {
    href: "/admin/media",
    label: "Thư Viện Mẫu In & Ảnh",
    subtitle: "Ảnh mẫu in, bao bì & xưởng",
    icon: ImageIcon,
  },
  {
    href: "/admin/blog",
    label: "Kiến Thức & Tin Tức In",
    subtitle: "Mẹo in ấn, case study",
    icon: FileText,
  },
];

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<string>("admin");

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/admin/login");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.username) setAdminUser(data.username);
        setAuthChecking(false);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  if (authChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09052f] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-300">
            <Printer size={16} className="text-brand-primary animate-pulse" />
            <span>Đang kết nối hệ thống quản trị Viet Dragon...</span>
          </div>
        </div>
      </div>
    );
  }

  // Find active nav item for breadcrumb
  const currentNav = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  ) || NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[#f4f6fb] text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Viet Dragon Deep Navy */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#09052f] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6 bg-[#060322]">
          <Link href="/admin" className="flex items-center gap-3">
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
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Danh Mục Quản Trị
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-lg shadow-brand-primary/30 font-bold"
                    : "text-zinc-300 hover:bg-white/8 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white"
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className="flex-1">
                  <div className="leading-tight">{item.label}</div>
                  <div
                    className={cn(
                      "text-[10px] mt-0.5 font-normal",
                      isActive ? "text-purple-200" : "text-zinc-400"
                    )}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Action Footer */}
        <div className="border-t border-white/10 bg-[#060322] p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white capitalize">{adminUser}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Quản lý xưởng & Báo giá</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/20 hover:text-white"
            >
              <ExternalLink size={12} /> Xem Web
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25 cursor-pointer"
            >
              <LogOut size={12} /> Thoát
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs lg:h-20 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/admin" className="hover:text-brand-primary transition-colors">
                Admin
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="font-bold text-slate-800">{currentNav.label}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Link to Customer Website */}
            <div className="hidden md:flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-100 px-3 py-1.5 text-xs text-purple-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Xưởng In & Showroom: <strong>HCM & Bình Dương</strong></span>
            </div>

            {/* Notification Indicator */}
            <Link
              href="/admin"
              title="Yêu cầu báo giá mới"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
              </span>
            </Link>

            {/* View Live Site Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-[#09052f] px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-primary transition-colors shadow-sm"
            >
              <span>Xem Web Khách Hàng</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
