import { cn } from "@/lib/utils";

// The header and card shell every console page repeats. Light-theme classes on purpose: the shell's
// `.admin-theme-root` rules in globals.css remap bg-white / text-slate-* / border-slate-* in dark mode.

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, icon, actions }: Readonly<PageHeaderProps>) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
          {icon} {eyebrow}
        </div>
        <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

type AdminCardProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function AdminCard({ title, description, action, className, children }: Readonly<AdminCardProps>) {
  return (
    <section className={cn("rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-white/10", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-black text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Shared button looks, so the console's actions read as one family. */
export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-primary/85 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
export const BUTTON_DANGER =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";
export const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-all focus:border-brand-primary focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20";
