import Link from "next/link";
import { Printer, ShieldCheck } from "lucide-react";

type AuthCardShellProps = {
  heading: string;
  /** Where the quiet link under the card goes. Defaults to the public website. */
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

/** The dark full-screen card used by sign-in and the forced password change — pages with no console around them. */
export function AuthCardShell({
  heading,
  backHref = "/",
  backLabel = "← Quay lại website Viet Dragon",
  children,
}: Readonly<AuthCardShellProps>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09052f] px-4 py-12 font-sans">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-primary/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary via-purple-500 to-pink-500 text-white shadow-xl shadow-brand-primary/40">
              <Printer size={24} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-white">
                VIET <span className="text-pink-400">DRAGON</span>
              </span>
              <p className="text-xs font-medium text-purple-200">Hệ Thống Quản Trị Xưởng In</p>
            </div>
          </Link>
          <p className="mt-3 text-xs text-zinc-400">Quản trị bảng giá, quy cách in, media và hệ thống 5 ngôn ngữ</p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-xs font-bold uppercase tracking-wider text-pink-300">
            <ShieldCheck size={16} /> {heading}
          </div>
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link href={backHref} className="text-xs text-zinc-400 transition-colors hover:text-white">
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
