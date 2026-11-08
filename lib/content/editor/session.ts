import type { Issue } from "../errors";
import type { ApiProblem, Document, DraftPayload } from "./api";

// The state of one editing session: the document on screen and where it stands against the server. Pure, so every transition is
// tested without a browser. The component runs the effects (the timer, the PUT) and dispatches what happened.
//
//   clean ──edit──► dirty ──save-started──► saving ──ok──► saved ──edit──► dirty …
//                     ▲                       │ edited while saving ──► dirty (one more save)
//                     └────── retry ◄── error ◄┤
//                                    conflict ◄┘  (someone else saved / the draft is gone)
//
// Saves never overlap: a save starts only from `dirty` or `error`, so the `If-Match` it sends is always the latest known.

export type SaveState = "clean" | "dirty" | "saving" | "saved" | "error" | "conflict";

export interface Session {
  document: Document;
  /** A draft is open (the form is editable). False = the live document is shown read-only. */
  editing: boolean;
  draftVersion: number | null;
  baseVersion: number | null;
  restoredFrom: number | null;
  issues: Issue[];
  save: SaveState;
  /** Counts local edits, so a save that finishes after more typing does not claim everything is saved. */
  editCount: number;
  editCountAtSave: number | null;
  problem: ApiProblem | null;
  savedAt: string | null;
}

export type SessionAction =
  | { type: "draft-loaded"; payload: DraftPayload }
  | { type: "edit"; document: Document }
  | { type: "save-started" }
  | { type: "save-succeeded"; payload: DraftPayload; at: string }
  | { type: "save-failed"; problem: ApiProblem }
  | { type: "draft-closed"; live: Document };

const FRESH = { save: "clean", editCount: 0, editCountAtSave: null, problem: null, savedAt: null } as const;

export function draftState(payload: DraftPayload): Omit<Session, "document"> & { document: Document } {
  const { draft, issues } = payload;
  return { document: draft.snapshot, editing: true, draftVersion: draft.draftVersion, baseVersion: draft.baseVersion, restoredFrom: draft.restoredFrom, issues, ...FRESH };
}

export function initialSession(live: Document, draft: DraftPayload | null): Session {
  if (draft) return draftState(draft);
  return { document: live, editing: false, draftVersion: null, baseVersion: null, restoredFrom: null, issues: [], ...FRESH };
}

/** Codes that mean "the server's draft is no longer the one this editor has" — saving again could only overwrite it. */
const CONFLICT_CODES: ReadonlySet<string> = new Set(["DRAFT_CHANGED", "GONE"]);

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case "draft-loaded":
      return draftState(action.payload);

    case "draft-closed":
      return initialSession(action.live, null);

    case "edit":
      if (!state.editing) return state;
      return { ...state, document: action.document, editCount: state.editCount + 1, save: state.save === "saving" || state.save === "conflict" ? state.save : "dirty" };

    case "save-started":
      if (!state.editing || (state.save !== "dirty" && state.save !== "error")) return state;
      return { ...state, save: "saving", editCountAtSave: state.editCount, problem: null };

    case "save-succeeded": {
      if (state.save !== "saving") return state;
      const { draft, issues } = action.payload;
      const caughtUp = state.editCount === state.editCountAtSave;
      return {
        ...state,
        draftVersion: draft.draftVersion,
        baseVersion: draft.baseVersion,
        issues,
        save: caughtUp ? "saved" : "dirty",
        savedAt: action.at,
        editCountAtSave: null,
        problem: null,
      };
    }

    case "save-failed":
      if (state.save !== "saving") return state;
      return { ...state, save: CONFLICT_CODES.has(action.problem.code) ? "conflict" : "error", editCountAtSave: null, problem: action.problem };
  }
}

/** The timer should run. */
export const shouldAutosave = (session: Session): boolean => session.editing && session.save === "dirty";

/** Leaving the page now would lose typing. */
export const hasUnsavedChanges = (session: Session): boolean => session.editing && (session.save === "dirty" || session.save === "saving" || session.save === "error" || session.save === "conflict");

/** Publishing needs everything saved (it publishes what the server holds) and nothing still wrong with the document. */
export const canPublish = (session: Session): boolean => session.editing && (session.save === "clean" || session.save === "saved") && session.issues.length === 0;

export function describeSave(session: Session, formatTime: (iso: string) => string): string {
  switch (session.save) {
    case "clean":
      return session.editing ? "Bản nháp đã lưu" : "";
    case "dirty":
      return "Có thay đổi chưa lưu…";
    case "saving":
      return "Đang lưu…";
    case "saved":
      return session.savedAt ? `Đã lưu lúc ${formatTime(session.savedAt)}` : "Đã lưu";
    case "error":
      return "Chưa lưu được — đang thử lại";
    case "conflict":
      return "Người khác vừa sửa bản nháp này";
  }
}
