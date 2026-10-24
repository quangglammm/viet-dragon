// Formatting helpers for the Vietnamese report.

const number = new Intl.NumberFormat("vi-VN");

/** 4045 → "4.045" */
export const n = (value: number): string => number.format(value);

export const percent = (part: number, whole: number): string => (whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`);

const MAX_EXAMPLES = 8;

const MAX_EXAMPLE_LENGTH = 180;
const clip = (text: string): string => (text.length > MAX_EXAMPLE_LENGTH ? `${text.slice(0, MAX_EXAMPLE_LENGTH)}…` : text);

/** Full sentences as bullets: never clipped or limited. */
export const lines = (items: readonly string[]): string => items.map((item) => `- ${item}`).join("\n");

/** A markdown bullet list of EXAMPLES: at most `max` items (each clipped; the appendix has them in full), with a pointer for the rest. */
export function bullets(items: readonly string[], max: number = MAX_EXAMPLES): string {
  const shown = items.slice(0, max).map((item) => `- ${clip(item)}`);
  if (items.length > max) shown.push(`- … và ${n(items.length - max)} mục khác (xem Phụ lục)`);
  return shown.join("\n");
}

/** One bullet stating a count, with up to `max` examples nested under it. */
export function counted(summary: string, items: readonly string[], max: number = MAX_EXAMPLES): string {
  if (items.length === 0) return `- ${summary} Không có.`;
  const nested = bullets(items, max).split("\n").map((line) => `  ${line}`);
  return [`- ${summary}`, ...nested].join("\n");
}

export function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const line = (cells: readonly string[]) => `| ${cells.join(" | ")} |`;
  return [line(header), line(header.map(() => "---")), ...rows.map(line)].join("\n");
}

export interface Decision {
  number: number;
  title: string;
  today: string;
  after: string;
  /** Facts computed from this run, as bullet text. */
  facts?: string;
  recommendation: string;
}

export function renderDecision(decision: Decision): string {
  return [
    `### Quyết định ${decision.number} — ${decision.title}`,
    `**Hiện nay:** ${decision.today}`,
    decision.facts ? `**Số liệu:**\n${decision.facts}` : "",
    `**Sau khi nhập:** ${decision.after}`,
    `**Đề xuất:** ${decision.recommendation}`,
    `**Quyết định:** ☐ Đồng ý với đề xuất    ☐ Khác: ____________________`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
