import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type NoticeTone = "error" | "success" | "info" | "warning";

const TONES: Record<NoticeTone, { icon: typeof Info; box: string }> = {
  error: { icon: XCircle, box: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200" },
  success: {
    icon: CheckCircle2,
    box: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  info: { icon: Info, box: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200" },
  warning: {
    icon: AlertTriangle,
    box: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
  },
};

type NoticeProps = {
  tone?: NoticeTone;
  className?: string;
  children: React.ReactNode;
};

/** Inline status message. Errors are announced immediately; the rest politely. */
export function Notice({ tone = "info", className, children }: Readonly<NoticeProps>) {
  const { icon: Icon, box } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs font-semibold leading-relaxed", box, className)}
    >
      <Icon size={16} className="mt-px shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
