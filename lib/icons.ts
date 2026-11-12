import {
  Award, BadgeCheck, Briefcase, Calendar, CheckCircle2, Clock, CloudFog, CreditCard, Droplets, Eye,
  Feather, FileText, Gem, Gift, Layers, Leaf, Minimize2, Package, Package2, Palette,
  PenLine, Printer, Scale, Shield, ShieldCheck, Shirt, Sparkles, Square, Stamp, StickyNote,
  SunMedium, Tag, Timer, Truck, User, Zap,
  type LucideIcon,
} from "lucide-react";

// The one icon registry. The database stores an icon as a NAME (categories, options, traits, materials, Fast Print
// items); this module is the only place that turns a name into a component, and the editor's icon picker lists
// exactly `ICON_NAMES` — an icon the UI cannot draw can never be chosen.
//
// It is the union of what four places used to keep separately: the category `iconMap` (copied into five files),
// `material-flashcard`'s map (which could draw 6 of the 16 icons the data uses), `material-traits`, and the Fast
// Print page. The catalog pages, the navbar, the flashcard and the Fast Print items draw through it (components/ui/named-icon.tsx).
//
// Explicit named imports (never `import * as icons`) so unused lucide icons stay out of the bundle. To offer a new
// icon: import it here and add it to ICONS — nothing else changes.

export const ICONS = {
  Award, BadgeCheck, Briefcase, Calendar, CheckCircle2, Clock, CloudFog, CreditCard, Droplets, Eye,
  Feather, FileText, Gem, Gift, Layers, Leaf, Minimize2, Package, Package2, Palette,
  PenLine, Printer, Scale, Shield, ShieldCheck, Shirt, Sparkles, Square, Stamp, StickyNote,
  SunMedium, Tag, Timer, Truck, User, Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

const DEFAULT_FALLBACK: LucideIcon = Layers;

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(ICONS, name);
}

/** The component for a stored icon name; `fallback` (default: Layers) when the name is empty or unknown. */
export function resolveIcon(name: string | null | undefined, fallback: LucideIcon = DEFAULT_FALLBACK): LucideIcon {
  return name && isIconName(name) ? ICONS[name] : fallback;
}
