import { notFound } from "next/navigation";

// With [locale] as the top-level dynamic segment, an unmatched URL never reaches
// [locale]/not-found.tsx on its own. This catch-all routes it there (next-intl's pattern).
export default function UnknownPathPage() {
  notFound();
}
