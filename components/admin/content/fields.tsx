"use client";

import { useState } from "react";
import { INPUT_CLASS } from "@/components/admin/page-parts";
import { LOCALES } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldFrame, type FieldProps } from "./field-shell";
import type { VocabOption, Vocabulary } from "@/lib/content/editor/vocabulary";

// The plain controls: text, number, switch, choice. Each is bound to a document path (see field-shell.tsx) and disabled while
// the live document is shown instead of a draft.

const MASTER_LANGUAGES: readonly string[] = ["vi", "en"];
const NOT_CHOSEN = "";

type TextFieldProps = FieldProps & {
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  /** Handles the typed text itself (a name that also feeds the slug) instead of the plain "set this path". */
  onText?: (text: string) => void;
};

export function TextField({ multiline = false, rows = 3, maxLength, placeholder, onText, hint, className, ...frameProps }: Readonly<TextFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const value = (editor.read(frameProps.path) as string | undefined) ?? "";
  const localized = frameProps.path.includes("*");
  // zh/ja/ko fall back to English when a text is missing: show it as the placeholder and offer to start from it.
  const englishPath = localized && !MASTER_LANGUAGES.includes(editor.language) ? frameProps.path.replace("*", "en") : null;
  const fallback = englishPath ? (editor.read(englishPath) as string | undefined) : undefined;
  const Control = multiline ? "textarea" : "input";

  return (
    <FieldShell
      frame={frame}
      hint={hint}
      className={className}
      aside={
        fallback && value === "" && !editor.readOnly ? (
          <button type="button" onClick={() => editor.changeText(frameProps.path, fallback)} className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer">
            Sao chép từ tiếng Anh
          </button>
        ) : undefined
      }
    >
      <Control
        id={frame.id}
        value={value}
        disabled={editor.readOnly}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        placeholder={placeholder ?? fallback}
        aria-invalid={frame.issues.length > 0}
        onChange={(event) => (onText ? onText(event.target.value) : editor.changeText(frameProps.path, event.target.value))}
        className={cn(INPUT_CLASS, multiline && "resize-y leading-relaxed", frame.issues.length > 0 && "border-rose-300")}
      />
    </FieldShell>
  );
}

type NumberFieldProps = FieldProps & { nullable?: boolean; min?: number; suffix?: string };

export function NumberField({ nullable = false, min = 0, suffix, hint, className, ...frameProps }: Readonly<NumberFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const stored = editor.read(frameProps.path) as number | null | undefined;
  // What is typed is kept as text while the field has focus ("-" and "" are valid steps on the way to a number).
  const [typed, setTyped] = useState<string | null>(null);
  const shown = typed ?? (stored === null || stored === undefined ? "" : String(stored));

  const commit = (text: string) => {
    setTyped(text);
    const trimmed = text.trim();
    if (trimmed === "") {
      editor.change(frameProps.path, nullable ? null : min);
    } else if (/^\d+$/.test(trimmed) && Number(trimmed) >= min) {
      editor.change(frameProps.path, Number(trimmed));
    }
  };

  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <div className="flex items-center gap-2">
        <input
          id={frame.id}
          inputMode="numeric"
          value={shown}
          disabled={editor.readOnly}
          aria-invalid={frame.issues.length > 0}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setTyped(null)}
          className={cn(INPUT_CLASS, "max-w-40", frame.issues.length > 0 && "border-rose-300")}
        />
        {suffix && <span className="text-xs font-semibold text-slate-500">{suffix}</span>}
      </div>
    </FieldShell>
  );
}

type SwitchFieldProps = FieldProps;

export function SwitchField({ hint, className, ...frameProps }: Readonly<SwitchFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const checked = editor.read(frameProps.path) === true;
  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <button
        id={frame.id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={editor.readOnly}
        onClick={() => editor.change(frameProps.path, !checked)}
        className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 cursor-pointer", checked ? "bg-brand-primary" : "bg-slate-300")}
      >
        <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </button>
    </FieldShell>
  );
}

type SelectFieldProps = FieldProps & {
  /** Fixed choices, or the name of a list the page loaded. */
  options: readonly VocabOption[] | keyof Vocabulary;
  /** Offer "none" as an answer (stored as null). */
  nullable?: boolean;
  nullLabel?: string;
  /** Handles the choice itself (changing a category or a scope has side effects) instead of the plain "set this path". */
  onValue?: (value: string | null) => void;
};

export function SelectField({ options, nullable = false, nullLabel = "— Không chọn —", onValue, hint, className, ...frameProps }: Readonly<SelectFieldProps>) {
  const frame = useFieldFrame(frameProps);
  const { editor } = frame;
  const choices = typeof options === "string" ? (editor.vocab[options] ?? []) : options;
  const current = (editor.read(frameProps.path) as string | null | undefined) ?? NOT_CHOSEN;
  // A value that no longer exists in the list (a deleted record) stays visible instead of silently turning into "none".
  const unknown = current !== NOT_CHOSEN && !choices.some((choice) => choice.value === current);

  return (
    <FieldShell frame={frame} hint={hint} className={className}>
      <select
        id={frame.id}
        value={current}
        disabled={editor.readOnly}
        aria-invalid={frame.issues.length > 0}
        onChange={(event) => {
          const chosen = event.target.value === NOT_CHOSEN ? null : event.target.value;
          if (onValue) onValue(chosen);
          else editor.change(frameProps.path, chosen === null && !nullable ? undefined : chosen);
        }}
        className={cn(INPUT_CLASS, frame.issues.length > 0 && "border-rose-300")}
      >
        {(nullable || current === NOT_CHOSEN) && <option value={NOT_CHOSEN}>{nullLabel}</option>}
        {unknown && <option value={current}>{current} (không còn tồn tại)</option>}
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export const LANGUAGE_NAMES: Record<(typeof LOCALES)[number], string> = { vi: "Tiếng Việt", en: "English", zh: "中文", ja: "日本語", ko: "한국어" };
