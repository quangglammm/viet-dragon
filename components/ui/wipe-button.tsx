import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-brand-primary text-white",
  dark: "bg-zinc-900 text-white",
  // The wipe fills with --brand-dark (see .btn-wipe in globals.css), so dark text
  // would go near-invisible against it once the corners meet — flip to white on hover.
  light: "bg-white text-zinc-900 transition-colors duration-300 hover:text-white",
} as const;

const sizeClasses = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-6 py-3.5 text-xs",
  lg: "px-8 py-4 text-sm",
} as const;

type WipeButtonProps = {
  href: string;
  children: ReactNode;
  tone?: keyof typeof toneClasses;
  size?: keyof typeof sizeClasses;
  arrow?: boolean;
  className?: string;
};

// The diagonal two-corner hover fill (`.btn-wipe`, defined in globals.css) wrapped
// in the standard CTA markup shape — this was duplicated with minor padding/tone
// variations across ~10 files.
export function WipeButton({
  href,
  children,
  tone = "primary",
  size = "md",
  arrow = true,
  className,
}: WipeButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-wipe inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide whitespace-nowrap text-center",
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
    >
      {children} {arrow && <span aria-hidden>→</span>}
    </Link>
  );
}
