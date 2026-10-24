// Pure parsers for the formatted strings the site's data files carry.

export interface ParsedPrice {
  /** Whole VND. */
  amount: number;
  /** The unit as written in that language ("Hộp", "Box", "箱"). */
  unit: string;
}

/** "Chỉ từ 120.000đ/Hộp" · "From 120,000đ/Box" · "120,000₫/箱〜" → amount + unit; null when the text has no price. */
export function parsePrice(text: string): ParsedPrice | null {
  const match = text.match(/([\d.,]+)\s*(?:đ|₫)\s*\/\s*([^\s〜]+)/);
  return match ? { amount: Number.parseInt(match[1].replace(/[.,]/g, ""), 10), unit: match[2] } : null;
}

export interface Dimensions {
  w: number;
  h: number;
  d: number | null;
}

/** "21 x 29.7 cm" or "10 x 5 x 3 cm" → millimetres. Null when not metric ("Size L - XL"). */
export function parseDimensionsCm(text: string, onFraction?: (text: string) => void): Dimensions | null {
  const match = text.match(/^(\d+(?:\.\d+)?) x (\d+(?:\.\d+)?)(?: x (\d+(?:\.\d+)?))? cm$/);
  if (!match) return null;
  const toMm = (centimetres: string): number => {
    const exact = Number.parseFloat(centimetres) * 10;
    const rounded = Math.round(exact);
    if (Math.abs(exact - rounded) > 1e-6) onFraction?.(text);
    return rounded;
  };
  return { w: toMm(match[1]), h: toMm(match[2]), d: match[3] ? toMm(match[3]) : null };
}
