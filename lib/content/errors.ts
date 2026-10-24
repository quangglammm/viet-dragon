import type { z } from "zod";
import type { Change } from "./diff";

// What the domain services refuse with. The HTTP layer maps them to 404 / 409 / 422; the messages are Vietnamese because
// an editor reads them (the admin is Vietnamese-only).

export interface Issue {
  /** The field the problem is about, `options[3].slugs.vi.slug`; empty when it is about the document as a whole. */
  path: string;
  message: string;
}

export type ConflictCode =
  /** The live entity changed after the draft started from it. */
  | "STALE_BASE"
  /** The draft changed after it was loaded or previewed. */
  | "DRAFT_CHANGED"
  /** A new entity was published, but one with that identity already exists. */
  | "ALREADY_EXISTS"
  /** The draft or the live entity it needs is gone (published, discarded, deleted). */
  | "GONE"
  /** There is already an open draft for the entity. */
  | "DRAFT_EXISTS";

export class Conflict extends Error {
  readonly status = 409;
  constructor(
    readonly code: ConflictCode,
    message: string,
    /** For STALE_BASE: what changed between the version the draft started from and now (live → draft). */
    readonly changes: readonly Change[] = [],
  ) {
    super(message);
    this.name = "Conflict";
  }
}

export class Invalid extends Error {
  readonly status = 422;
  readonly code = "INVALID";
  constructor(readonly issues: readonly Issue[]) {
    const [first] = issues;
    super(first ? `${first.message}${issues.length > 1 ? ` (và ${issues.length - 1} lỗi khác)` : ""}` : "Dữ liệu không hợp lệ.");
    this.name = "Invalid";
  }
}

export class NotFound extends Error {
  readonly status = 404;
  readonly code = "NOT_FOUND";
  constructor(message = "Không tìm thấy.") {
    super(message);
    this.name = "NotFound";
  }
}

export type ContentError = Conflict | Invalid | NotFound;

export const isContentError = (error: unknown): error is ContentError => error instanceof Conflict || error instanceof Invalid || error instanceof NotFound;

/** zod / field paths as the dotted form used in `Issue.path`: `["options", 3, "slugs"]` → `options[3].slugs`. */
function pathToString(path: readonly PropertyKey[]): string {
  return path.reduce<string>((text, part) => (typeof part === "number" ? `${text}[${part}]` : text === "" ? String(part) : `${text}.${String(part)}`), "");
}

/** A zod failure as the issues an editor sees. */
export const zodIssues = (error: z.ZodError): Issue[] => error.issues.map((issue) => ({ path: pathToString(issue.path), message: issue.message }));
