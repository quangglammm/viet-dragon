import type { Change } from "@/lib/content/diff";
import type { DraftEntityType } from "@/lib/content/entity-types";
import { fieldLabel } from "@/lib/content/field-registry";
import { cn } from "@/lib/utils";

// A list of field-level changes, in the editor's own words: «Tên sản phẩm (en): "Flyers" → "Leaflets"».

const KIND: Record<Change["kind"], { label: string; tone: string }> = {
  added: { label: "Thêm", tone: "bg-emerald-100 text-emerald-700" },
  removed: { label: "Xóa", tone: "bg-rose-100 text-rose-700" },
  changed: { label: "Sửa", tone: "bg-amber-100 text-amber-800" },
};

const MAX_SHOWN = 140;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

/**
 * A whole row that was added or removed, in a word an editor knows: its Vietnamese text (a bullet), else its Vietnamese name (a shape,
 * an option), else what it holds (a menu column's groups, a menu group's links).
 */
function nameOfRow(value: unknown): string | null {
  const row = value as { i18n?: { vi?: unknown }; groups?: unknown; items?: unknown } | null;
  const vi = row?.i18n?.vi;
  if (typeof vi === "string") return vi;
  const name = typeof vi === "object" && vi !== null ? Object.values(vi).find((text) => typeof text === "string" && text !== "") : undefined;
  if (typeof name === "string") return name;
  if (Array.isArray(row?.groups)) return `${row.groups.length} nhóm sản phẩm`;
  if (Array.isArray(row?.items)) return `${row.items.length} mục`;
  return null;
}

function show(value: unknown): string {
  if (value === undefined) return "";
  if (value === null || value === "") return "(trống)";
  const text = typeof value === "string" ? value : (nameOfRow(value) ?? JSON.stringify(value));
  return text.length > MAX_SHOWN ? `${text.slice(0, MAX_SHOWN - 1)}…` : text;
}

/** `options[3f2a1c9e-…].prices.base` → `options[#3f2a1c9e].prices.base` (or the record's name, when the editor knows it): enough to tell the rows apart. */
const shortPath = (path: string, names?: ReadonlyMap<string, string>): string => path.replace(UUID, (id) => (names?.has(id) ? `«${names.get(id)}»` : `#${id.slice(0, 8)}`));

type DiffViewProps = {
  type: DraftEntityType;
  changes: readonly Change[];
  empty?: string;
  /** Names for the ids in a path (a menu group's product, a link's shape): the lists the editor already loaded. */
  names?: ReadonlyMap<string, string>;
};

export function DiffView({ type, changes, empty = "Không có thay đổi.", names }: Readonly<DiffViewProps>) {
  if (changes.length === 0) return <p className="text-xs font-semibold text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-2">
      {changes.map((change) => (
        <li key={`${change.kind}:${change.path}`} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-black", KIND[change.kind].tone)}>{KIND[change.kind].label}</span>
            <span className="text-xs font-bold text-slate-800">{change.path === "" ? "Toàn bộ nội dung" : fieldLabel(type, change.path, true)}</span>
            <span className="truncate font-mono text-[10px] text-slate-400">{shortPath(change.path, names)}</span>
          </div>
          <div className="mt-1.5 grid gap-1 text-xs sm:grid-cols-2">
            {change.kind !== "added" && <p className="break-words rounded-lg bg-rose-50 px-2 py-1 text-rose-800 line-through decoration-rose-300">{show(change.before)}</p>}
            {change.kind !== "removed" && <p className="break-words rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">{show(change.after)}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
