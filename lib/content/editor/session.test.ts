import { describe, expect, it } from "vitest";
import type { ApiProblem, DraftPayload } from "./api";
import { canPublish, describeSave, hasUnsavedChanges, initialSession, sessionReducer, shouldAutosave, type Session, type SessionAction } from "./session";

const payload = (draftVersion: number, snapshot: Record<string, never> = {}, issues: DraftPayload["issues"] = []): DraftPayload => ({
  draft: { ref: { type: "unit", id: "box" }, baseVersion: 2, draftVersion, snapshot, restoredFrom: null, createdBy: null, updatedBy: null, createdAt: "", updatedAt: "" },
  issues,
});
const problem = (code: string, status = 409): ApiProblem => ({ status, code, message: "x" });
const run = (state: Session, ...actions: SessionAction[]) => actions.reduce(sessionReducer, state);
const editing = () => initialSession({}, payload(1));

describe("starting", () => {
  it("shows the live document read-only when there is no draft", () => {
    expect(initialSession({ a: 1 }, null)).toMatchObject({ editing: false, draftVersion: null, save: "clean" });
  });
  it("resumes an open draft as clean", () => {
    expect(editing()).toMatchObject({ editing: true, draftVersion: 1, baseVersion: 2, save: "clean" });
  });
  it("ignores edits while only viewing", () => {
    const viewing = initialSession({}, null);
    expect(sessionReducer(viewing, { type: "edit", document: { a: 1 } })).toBe(viewing);
  });
});

describe("saving", () => {
  it("clean → dirty → saving → saved, taking the server's version and advice", () => {
    let s = run(editing(), { type: "edit", document: { a: 1 } });
    expect(s.save).toBe("dirty");
    expect(shouldAutosave(s)).toBe(true);
    s = run(s, { type: "save-started" });
    expect(s.save).toBe("saving");
    expect(shouldAutosave(s)).toBe(false);
    s = run(s, { type: "save-succeeded", payload: payload(2, {}, [{ path: "x", message: "thiếu" }]), at: "t" });
    expect(s).toMatchObject({ save: "saved", draftVersion: 2, savedAt: "t", issues: [{ path: "x", message: "thiếu" }] });
    expect(s.document).toEqual({ a: 1 }); // the local text is kept, not replaced by the echo
  });

  it("typing while a save is in flight is not lost: it ends dirty and the next save starts from the new version", () => {
    let s = run(editing(), { type: "edit", document: { a: 1 } }, { type: "save-started" }, { type: "edit", document: { a: 12 } });
    expect(s.save).toBe("saving");
    s = run(s, { type: "save-succeeded", payload: payload(2), at: "t" });
    expect(s).toMatchObject({ save: "dirty", draftVersion: 2, document: { a: 12 } });
    expect(shouldAutosave(s)).toBe(true);
  });

  it("never starts a second save while one is running, nor from a clean or conflicted state", () => {
    const saving = run(editing(), { type: "edit", document: { a: 1 } }, { type: "save-started" });
    expect(sessionReducer(saving, { type: "save-started" })).toBe(saving);
    expect(sessionReducer(editing(), { type: "save-started" }).save).toBe("clean");
  });

  it("ignores a save result that arrives when no save is running", () => {
    const s = editing();
    expect(sessionReducer(s, { type: "save-succeeded", payload: payload(9), at: "t" })).toBe(s);
    expect(sessionReducer(s, { type: "save-failed", problem: problem("NETWORK", 0) })).toBe(s);
  });
});

describe("failures", () => {
  const saving = () => run(editing(), { type: "edit", document: { a: 1 } }, { type: "save-started" });

  it("a network or server failure is an error that can be retried", () => {
    let s = run(saving(), { type: "save-failed", problem: problem("NETWORK", 0) });
    expect(s).toMatchObject({ save: "error", problem: { code: "NETWORK" } });
    expect(shouldAutosave(s)).toBe(false);
    s = run(s, { type: "save-started" });
    expect(s.save).toBe("saving");
    expect(s.problem).toBeNull();
  });

  it.each(["DRAFT_CHANGED", "GONE"])("%s is a conflict: saving stops and nothing is overwritten", (code) => {
    let s = run(saving(), { type: "save-failed", problem: problem(code) });
    expect(s.save).toBe("conflict");
    s = run(s, { type: "edit", document: { a: 2 } });
    expect(s.save).toBe("conflict"); // typing on does not re-arm the save
    expect(sessionReducer(s, { type: "save-started" })).toBe(s);
    expect(hasUnsavedChanges(s)).toBe(true);
  });

  it("a conflict is resolved by loading the server's draft", () => {
    const conflicted = run(saving(), { type: "save-failed", problem: problem("DRAFT_CHANGED") });
    const s = run(conflicted, { type: "draft-loaded", payload: payload(7, {}) });
    expect(s).toMatchObject({ save: "clean", draftVersion: 7, editCount: 0, problem: null });
  });
});

describe("publishing and leaving", () => {
  it("can publish only when everything is saved and the document has no issues", () => {
    expect(canPublish(editing())).toBe(true);
    expect(canPublish(run(editing(), { type: "edit", document: { a: 1 } }))).toBe(false);
    expect(canPublish(initialSession({}, payload(1, {}, [{ path: "a", message: "m" }])))).toBe(false);
    expect(canPublish(initialSession({}, null))).toBe(false);
  });

  it("warns about unsaved changes only while editing and not yet saved", () => {
    expect(hasUnsavedChanges(editing())).toBe(false);
    expect(hasUnsavedChanges(run(editing(), { type: "edit", document: { a: 1 } }))).toBe(true);
    const saved = run(editing(), { type: "edit", document: { a: 1 } }, { type: "save-started" }, { type: "save-succeeded", payload: payload(2), at: "t" });
    expect(hasUnsavedChanges(saved)).toBe(false);
    expect(hasUnsavedChanges(initialSession({}, null))).toBe(false);
  });

  it("goes back to the live view after a publish or a discard", () => {
    const s = run(editing(), { type: "edit", document: { a: 1 } }, { type: "draft-closed", live: { b: 2 } });
    expect(s).toMatchObject({ editing: false, document: { b: 2 }, draftVersion: null, save: "clean" });
  });
});

describe("describeSave", () => {
  const time = (iso: string) => `[${iso}]`;
  it("says in Vietnamese where the draft stands", () => {
    expect(describeSave(initialSession({}, null), time)).toBe("");
    expect(describeSave(editing(), time)).toBe("Bản nháp đã lưu");
    expect(describeSave(run(editing(), { type: "edit", document: { a: 1 } }), time)).toMatch(/chưa lưu/);
    const saved = run(editing(), { type: "edit", document: { a: 1 } }, { type: "save-started" }, { type: "save-succeeded", payload: payload(2), at: "T" });
    expect(describeSave(saved, time)).toBe("Đã lưu lúc [T]");
  });
});
