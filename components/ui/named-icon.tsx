import type { LucideProps } from "lucide-react";
import { ICONS, isIconName, type IconName } from "@/lib/icons";

/** An icon the content database names (`lib/icons.ts` is the registry); an unknown or missing name draws the fallback. */
export function NamedIcon({ name, fallback = "Layers", ...props }: Readonly<{ name: string | null | undefined; fallback?: IconName } & Omit<LucideProps, "name">>) {
  const Icon = name && isIconName(name) ? ICONS[name] : ICONS[fallback];
  return <Icon {...props} />;
}
