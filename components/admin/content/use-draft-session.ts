"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { createContentApi, type ApiProblem, type Document, type DraftPayload, type Ref } from "@/lib/content/editor/api";
import { hasUnsavedChanges, initialSession, sessionReducer } from "@/lib/content/editor/session";

// Runs the effects of a draft session (lib/content/editor/session.ts is the state machine): the debounced autosave, the retry
// after a failure, the warning before leaving with unsaved typing, and the three ways out of a conflict.

const AUTOSAVE_DELAY_MS = 1200;
const RETRY_DELAY_MS = 5000;

type Options = { entity: Ref; live: Document | null; initialDraft: DraftPayload | null };

export function useDraftSession({ entity, live, initialDraft }: Options) {
  const api = useMemo(() => createContentApi(), []);
  const [session, dispatch] = useReducer(sessionReducer, undefined, () => initialSession(live ?? {}, initialDraft));
  const [problem, setProblem] = useState<ApiProblem | null>(null);

  useEffect(() => {
    if ((session.save !== "dirty" && session.save !== "error") || session.draftVersion === null) return;
    const { document, draftVersion } = session;
    const timer = setTimeout(() => {
      dispatch({ type: "save-started" });
      void api.saveDraft(entity, document, draftVersion).then((result) => {
        dispatch(result.ok ? { type: "save-succeeded", payload: result.data, at: new Date().toISOString() } : { type: "save-failed", problem: result.problem });
      });
    }, session.save === "dirty" ? AUTOSAVE_DELAY_MS : RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [api, entity, session]);

  const unsaved = hasUnsavedChanges(session);
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const edit = useCallback((document: Document) => dispatch({ type: "edit", document }), []);
  const adopt = useCallback((payload: DraftPayload) => {
    setProblem(null);
    dispatch({ type: "draft-loaded", payload });
  }, []);

  /** The draft is gone (discarded): show the live document again. The page's props may not have changed, so this cannot wait for them. */
  const closeDraft = useCallback((liveDocument: Document) => {
    setProblem(null);
    dispatch({ type: "draft-closed", live: liveDocument });
  }, []);

  /** Opens the draft of a live entity for editing. */
  const startEditing = async () => {
    setProblem(null);
    const result = await api.openDraft(entity);
    if (result.ok) adopt(result.data);
    else setProblem(result.problem);
  };

  /** After a conflict: take the draft as the server has it (what was typed since is dropped). */
  const reload = async () => {
    setProblem(null);
    const result = await api.getDraft(entity);
    if (result.ok) adopt(result.data);
    else setProblem(result.problem);
  };

  /** After a conflict: keep what is on screen and save it over the server's draft, knowingly. */
  const overwrite = async () => {
    setProblem(null);
    const fresh = await api.getDraft(entity);
    if (!fresh.ok) return setProblem(fresh.problem);
    const saved = await api.saveDraft(entity, session.document, fresh.data.draft.draftVersion);
    if (saved.ok) adopt(saved.data);
    else setProblem(saved.problem);
  };

  return { session, problem, edit, adopt, closeDraft, startEditing, reload, overwrite };
}
