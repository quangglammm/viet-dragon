import { AdminCard } from "@/components/admin/page-parts";
import { cn } from "@/lib/utils";

/** A titled group of fields, two columns on wide screens. */
export function FormCard({ title, description, columns = 2, children }: Readonly<{ title: string; description?: string; columns?: 1 | 2; children: React.ReactNode }>) {
  return (
    <AdminCard title={title} description={description}>
      <div className={cn("grid gap-4", columns === 2 && "md:grid-cols-2")}>{children}</div>
    </AdminCard>
  );
}

/** The identity of a record, shown as context: it cannot be changed. */
export function KeyBadge({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <p className="text-xs font-semibold text-slate-500">
      {label}: <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">{value}</code>
      <span className="ml-2 text-[11px]">(không đổi được)</span>
    </p>
  );
}
