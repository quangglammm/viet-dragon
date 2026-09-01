"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowRight, ShieldCheck, Printer, Eye, EyeOff, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Không thể kết nối đến máy chủ");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09052f] px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Elements */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-primary/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary via-purple-500 to-pink-500 text-white shadow-xl shadow-brand-primary/40">
              <Printer size={24} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-white">
                  VIET <span className="text-pink-400">DRAGON</span>
                </span>
              </div>
              <p className="text-xs text-purple-200 font-medium">Hệ Thống Quản Trị Xưởng In</p>
            </div>
          </Link>
          <p className="mt-3 text-xs text-zinc-400">
            Quản trị bảng giá, quy cách in, media và hệ thống 5 ngôn ngữ
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl text-white">
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-300">
              <ShieldCheck size={16} /> Cổng Đăng Nhập Quản Trị
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles size={11} /> 283 Trang Sẵn Sàng
            </span>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/20 p-3.5 text-xs font-semibold text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-200">
                Tài khoản quản trị
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-500 transition-all focus:border-brand-primary focus:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-200">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-xs font-semibold text-white placeholder-zinc-500 transition-all focus:border-brand-primary focus:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                Tài khoản xưởng: <span className="font-mono text-pink-300 font-bold">admin</span> / <span className="font-mono text-pink-300 font-bold">vietdragon2026@admin</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary via-purple-600 to-pink-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/35 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Truy Cập Bàn Làm Việc <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            ← Quay lại website Viet Dragon
          </Link>
        </div>
      </div>
    </div>
  );
}
