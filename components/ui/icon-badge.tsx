import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-11 h-11",
  lg: "w-12 h-12",
} as const;

const iconSizes = { sm: 13, md: 18, lg: 20 } as const;

type IconBadgeProps = {
  icon: LucideIcon;
  size?: keyof typeof sizeClasses;
  rounded?: "full" | "xl";
  strokeWidth?: number;
  className?: string;
};

// Icon-in-circle badge (`bg-brand-primary` + centered lucide icon), duplicated
// with varying sizes across About/Process/Quality.
export function IconBadge({
  icon: Icon,
  size = "md",
  rounded = "full",
  strokeWidth,
  className,
}: Readonly<IconBadgeProps>) {
  return (
    <span
      className={cn(
        "flex items-center justify-center bg-brand-primary text-white shrink-0",
        rounded === "full" ? "rounded-full" : "rounded-xl",
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} strokeWidth={strokeWidth} />
    </span>
  );
}
