import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const toneClasses = {
  primary: "bg-brand-primary text-white",
  // zinc-900 is nearly indistinguishable from the default brand-dark wipe fill, so
  // this tone fills white instead (.btn-wipe-invert, see globals.css) and flips
  // text dark to stay legible against it — opposite of the `light` tone.
  dark: "btn-wipe-invert bg-zinc-900 text-white transition-colors duration-300 hover:text-zinc-900",
  // The wipe fills with --brand-dark (see .btn-wipe in globals.css), so dark text
  // would go near-invisible against it once the corners meet — flip to white on hover.
  light: "bg-white text-zinc-900 transition-colors duration-300 hover:text-white",
  // Secondary/ghost weight — transparent center, so the wipe fill is the only
  // background a hover ever introduces (no separate bg tint layered on top).
  // Border fades out on hover so the fill reads as a clean rectangle, not an
  // outlined one.
  outline: "bg-transparent border-2 border-white/40 text-white transition-colors duration-300 hover:border-transparent",
} as const;

const sizeClasses = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-6 py-3.5 text-xs",
  lg: "px-8 py-4 text-sm",
} as const;

// tel:/mailto:/absolute URLs must render as a plain <a> — the i18n Link is for
// in-app pathnames only and shouldn't get a locale prefix stitched onto them.
const EXTERNAL_HREF = /^(tel:|mailto:|https?:\/\/)/;

type WipeButtonProps = {
  href: string;
  children: ReactNode;
  tone?: keyof typeof toneClasses;
  size?: keyof typeof sizeClasses;
  arrow?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

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
  ...rest
}: WipeButtonProps) {
  const classes = cn(
    "btn-wipe inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide whitespace-nowrap text-center",
    toneClasses[tone],
    sizeClasses[size],
    className
  );
  const content = (
    <>
      {children} {arrow && <span aria-hidden>→</span>}
    </>
  );

  if (EXTERNAL_HREF.test(href)) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
