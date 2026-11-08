"use client";

import { fieldLabel } from "@/lib/content/field-registry";
import type { DraftEntityType } from "@/lib/content/entity-types";
import type { Issue } from "@/lib/content/errors";
import { LOCALES, type LocaleCode } from "@/lib/content/schemas";
import { Notice } from "@/components/admin/notice";

// «Cần bổ sung»: everything the document still lacks, in one place, each with a way to the field. The same advice is shown
// next to the field itself; this is the list that also catches a problem hiding in another language tab.

const LANGUAGE_IN_PATH = new RegExp(`\\.(${LOCALES.join("|")})(?=\\.|$)`);

export const languageOfPath = (path: string): LocaleCode | null => (LANGUAGE_IN_PATH.exec(path)?.[1] as LocaleCode | undefined) ?? null;

type IssueListProps = {
  type: DraftEntityType;
  issues: readonly Issue[];
  onGo: (issue: Issue) => void;
};

export function IssueList({ type, issues, onGo }: Readonly<IssueListProps>) {
  if (issues.length === 0) return null;
  return (
    <Notice tone="warning">
      <p className="font-black">Cần bổ sung ({issues.length})</p>
      <ul className="mt-1.5 space-y-1">
        {issues.map((issue) => (
          <li key={`${issue.path}:${issue.message}`}>
            <button type="button" onClick={() => onGo(issue)} className="cursor-pointer text-left underline-offset-2 hover:underline">
              {issue.path ? <strong>{fieldLabel(type, issue.path)}: </strong> : null}
              {issue.message}
            </button>
          </li>
        ))}
      </ul>
    </Notice>
  );
}
