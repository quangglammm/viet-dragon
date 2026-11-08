import { cn } from "@/lib/utils";

// The colors of the three post categories the site started with, by key; a category an editor adds gets the neutral one.
const COLORS: Record<string, string> = {
  tips: "bg-blue-50 text-blue-600",
  "case-study": "bg-amber-50 text-amber-600",
  news: "bg-emerald-50 text-emerald-600",
};
const NEUTRAL = "bg-zinc-100 text-zinc-600";

export function PostCategoryBadge({ category, className }: Readonly<{ category: { key: string; label: string }; className?: string }>) {
  return <span className={cn("rounded-full font-semibold", COLORS[category.key] ?? NEUTRAL, className)}>{category.label}</span>;
}
