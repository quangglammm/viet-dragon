"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "vd_admin_theme";

function applyTheme(theme: AdminTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Light/dark preference, remembered per browser. The inline script in the admin root layout applies it before paint. */
export function useAdminTheme(): [AdminTheme, (theme: AdminTheme) => void] {
  const [theme, setThemeState] = useState<AdminTheme>("light");

  useEffect(() => {
    // Deferred a tick so the first render matches the server's (always light) markup.
    const timer = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial: AdminTheme = saved === "dark" ? "dark" : "light";
      setThemeState(initial);
      applyTheme(initial);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = (next: AdminTheme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return [theme, setTheme];
}

type ThemeToggleProps = { theme: AdminTheme; onChange: (theme: AdminTheme) => void };

export function ThemeToggle({ theme, onChange }: Readonly<ThemeToggleProps>) {
  return (
    <div className="flex items-center rounded-xl border border-slate-200/80 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/10">
      <button
        type="button"
        onClick={() => onChange("light")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer",
          theme === "light" ? "bg-white text-amber-500 shadow-xs" : "text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white",
        )}
        title="Giao diện sáng"
        aria-label="Giao diện sáng"
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("dark")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer",
          theme === "dark"
            ? "bg-[#1e293b] text-purple-300 shadow-xs dark:bg-brand-primary dark:text-white"
            : "text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white",
        )}
        title="Giao diện tối"
        aria-label="Giao diện tối"
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
