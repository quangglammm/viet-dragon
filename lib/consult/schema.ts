import { z } from "zod";
import { cleanPhone, isPhoneNumber } from "@/lib/phone";

// What the consult forms may send, and what the server makes of it. Nothing here trusts the browser: every field has a length cap, control
// characters are removed (they have no place in a name and are how a subject line gets a second header), and the product link is kept only
// if it points at THIS site — it ends up as a link in an email to the shop owner, so a link to anywhere else would be a phishing tool.

export const MAX_CONSULT_BODY_BYTES = 8 * 1024;
export const CONSULT_FIELD_LIMITS = { phone: 20, name: 200, size: 120, url: 500, honeypot: 200 } as const;

export const CONSULT_MESSAGES = {
  phone: "Số điện thoại không hợp lệ",
  invalid: "Dữ liệu gửi lên không hợp lệ.",
  rateLimited: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi hotline.",
  tooLarge: "Nội dung gửi lên quá lớn.",
} as const;

const DEFAULT_PRODUCT_NAME = "Sản phẩm Viet Dragon";

// Control, line- and paragraph-separator characters.
const UNWANTED = /[\p{Cc}\p{Zl}\p{Zp}]/gu;

/** One line of plain text: unwanted characters become spaces, runs of white space collapse, the ends are trimmed. */
export const tidy = (value: string): string => value.replace(UNWANTED, " ").replace(/\s+/g, " ").trim();

const text = (max: number) => z.string().max(max).optional();

const consultBody = z.object({
  phone: z.string().max(CONSULT_FIELD_LIMITS.phone),
  productName: text(CONSULT_FIELD_LIMITS.name),
  materialName: text(CONSULT_FIELD_LIMITS.name),
  sizeLabel: text(CONSULT_FIELD_LIMITS.size),
  sizeDims: text(CONSULT_FIELD_LIMITS.size),
  productUrl: text(CONSULT_FIELD_LIMITS.url),
  /** The honeypot: a real visitor never sees this field, so never fills it. */
  website: text(CONSULT_FIELD_LIMITS.honeypot),
});

export interface Lead {
  /** Digits only apart from a leading `+`: already validated. */
  phone: string;
  productName: string;
  materialName: string;
  sizeLabel: string;
  sizeDims: string;
  /** A link on this site, or null. */
  productUrl: string | null;
}

export type ParsedConsult = { kind: "lead"; lead: Lead } | { kind: "honeypot" } | { kind: "invalid"; message: string };

/** `raw` if it is an http(s) link on `siteOrigin`, normalised; otherwise null (dropped, not an error: the lead itself is still good). */
export function sameSiteUrl(raw: string, siteOrigin: string): string | null {
  try {
    const url = new URL(raw);
    return (url.protocol === "https:" || url.protocol === "http:") && url.origin === siteOrigin ? url.href : null;
  } catch {
    return null;
  }
}

export function parseConsult(body: unknown, siteOrigin: string): ParsedConsult {
  const parsed = consultBody.safeParse(body);
  if (!parsed.success) return { kind: "invalid", message: CONSULT_MESSAGES.invalid };
  const { phone, productName, materialName, sizeLabel, sizeDims, productUrl, website } = parsed.data;
  // A bot fills every field it finds. It is answered as if it had succeeded, so it learns nothing, and nothing is sent.
  if (website !== undefined && tidy(website) !== "") return { kind: "honeypot" };
  const number = cleanPhone(phone);
  if (!isPhoneNumber(number)) return { kind: "invalid", message: CONSULT_MESSAGES.phone };
  return {
    kind: "lead",
    lead: {
      phone: number,
      productName: tidy(productName ?? "") || DEFAULT_PRODUCT_NAME,
      materialName: tidy(materialName ?? ""),
      sizeLabel: tidy(sizeLabel ?? ""),
      sizeDims: tidy(sizeDims ?? ""),
      productUrl: productUrl ? sameSiteUrl(tidy(productUrl), siteOrigin) : null,
    },
  };
}
