import { Invalid, isContentError } from "./errors";

// Turns what PostgreSQL says into something an editor can act on. The application checks first (zod, `checkReferences`),
// so these are the rules only the database can see: another product's URL, a row a menu still points at, the
// commit-time invariants. Drizzle wraps the driver's error (`DrizzleQueryError.cause`), and a deferred constraint fails
// at COMMIT, so the original error may sit a few levels down.

export interface DatabaseErrorInfo {
  code: string;
  constraint: string | undefined;
  message: string;
}

const MAX_CAUSE_DEPTH = 5;
const SQLSTATE = /^[0-9A-Z]{5}$/;

export function databaseErrorOf(error: unknown): DatabaseErrorInfo | null {
  let current: unknown = error;
  for (let depth = 0; depth < MAX_CAUSE_DEPTH && typeof current === "object" && current !== null; depth += 1) {
    const candidate = current as { code?: unknown; constraint?: unknown; message?: unknown; cause?: unknown };
    if (typeof candidate.code === "string" && SQLSTATE.test(candidate.code)) {
      return {
        code: candidate.code,
        constraint: typeof candidate.constraint === "string" ? candidate.constraint : undefined,
        message: typeof candidate.message === "string" ? candidate.message.split("\n")[0] : "",
      };
    }
    current = candidate.cause;
  }
  return null;
}

interface Rule {
  code: string;
  constraint: RegExp;
  message: string;
}

const RULES: readonly Rule[] = [
  { code: "23505", constraint: /^product_slug_locale_category_id_slug_pk$/, message: "Đường dẫn này (trong danh mục, theo ngôn ngữ) đã được sản phẩm khác dùng, hoặc là đường dẫn cũ của sản phẩm khác." },
  { code: "23505", constraint: /^product_segment_product_id_locale_slug_pk$/, message: "Đường dẫn của một hình dạng hoặc tùy chọn bị trùng trong sản phẩm (đường dẫn cũ cũng được tính)." },
  { code: "23505", constraint: /^post_slug_locale_slug_pk$/, message: "Đường dẫn bài viết này (theo ngôn ngữ) đã được bài khác dùng, hoặc là đường dẫn cũ của bài khác." },
  { code: "23505", constraint: /^category_slug_locale_slug_pk$/, message: "Đường dẫn danh mục này (theo ngôn ngữ) đã được danh mục khác dùng." },
  { code: "23505", constraint: /_uid_(unique|key)$/, message: "Một mã định danh (uid) trong tài liệu đã thuộc về bản ghi khác." },
  { code: "23503", constraint: /^menu_item_(shape|option)_fk$/, message: "Một hình dạng hoặc tùy chọn bị xóa vẫn còn được menu dùng — hãy gỡ nó khỏi menu trước." },
  { code: "23503", constraint: /_og_media_fk$|^option_image_media_fk$/, message: "Ô này chỉ nhận ảnh, không nhận video." },
  { code: "23503", constraint: /./, message: "Có tham chiếu trỏ tới một bản ghi không còn tồn tại, hoặc bản ghi này vẫn đang được nơi khác sử dụng." },
];

/**
 * A domain error stays as it is; a database error the editor can fix becomes `Invalid`; anything else is returned untouched
 * (a bug or an outage, which must not be disguised as a validation problem).
 */
export function humanize(error: unknown): unknown {
  if (isContentError(error)) return error;
  const info = databaseErrorOf(error);
  if (!info) return error;
  const rule = RULES.find((r) => r.code === info.code && r.constraint.test(info.constraint ?? ""));
  if (rule) return new Invalid([{ path: "", message: rule.message }]);
  if (info.code === "23514") return new Invalid([{ path: "", message: `Dữ liệu vi phạm một quy tắc toàn vẹn: ${info.constraint ?? info.message}` }]);
  return error;
}
