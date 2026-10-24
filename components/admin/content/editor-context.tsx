"use client";

import { createContext, useContext, useMemo } from "react";
import type { DraftEntityType } from "@/lib/content/entity-types";
import type { Issue } from "@/lib/content/errors";
import type { Document } from "@/lib/content/editor/api";
import { getIn, removeIn, setIn, setText, type Json } from "@/lib/content/editor/paths";
import type { Vocabulary } from "@/lib/content/editor/vocabulary";
import type { LocaleCode } from "@/lib/content/schemas";

// What the field controls need from the editor around them. A control is given a PATH into the document and reads/writes through
// this context, so it knows nothing of drafts, saving or the entity it belongs to.

export interface EditorApi {
  type: DraftEntityType;
  document: Document;
  /** The language tab being edited: `*` in a control's path stands for it. */
  language: LocaleCode;
  /** The live document is shown, not a draft: controls are disabled. */
  readOnly: boolean;
  issues: readonly Issue[];
  vocab: Vocabulary;
  /** Concrete path of a template path (`i18n.*.title` → `i18n.vi.title`). */
  resolve: (path: string) => string;
  read: (path: string) => unknown;
  /** Sets any value; `undefined` removes the key. */
  change: (path: string, value: Json | undefined) => void;
  /** Sets an optional text: blank removes the key (and an emptied language row). */
  changeText: (path: string, text: string) => void;
  /** Replaces the whole document (list operations: add, remove, move). */
  replace: (next: Document) => void;
}

const EditorContext = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const api = useContext(EditorContext);
  if (!api) throw new Error("A content field must be rendered inside an <EditorProvider>.");
  return api;
}

type EditorProviderProps = {
  type: DraftEntityType;
  document: Document;
  language: LocaleCode;
  readOnly: boolean;
  issues: readonly Issue[];
  vocab: Vocabulary;
  onChange: (next: Document) => void;
  children?: React.ReactNode;
};

export function EditorProvider({ type, document, language, readOnly, issues, vocab, onChange, children }: Readonly<EditorProviderProps>) {
  const api = useMemo<EditorApi>(() => {
    const resolve = (path: string) => path.replace("*", language);
    return {
      type,
      document,
      language,
      readOnly,
      issues,
      vocab,
      resolve,
      read: (path) => getIn(document, resolve(path)),
      change: (path, value) => onChange(value === undefined ? removeIn(document, resolve(path)) : setIn(document, resolve(path), value)),
      changeText: (path, text) => onChange(setText(document, resolve(path), text)),
      replace: onChange,
    };
  }, [type, document, language, readOnly, issues, vocab, onChange]);
  return <EditorContext.Provider value={api}>{children}</EditorContext.Provider>;
}
