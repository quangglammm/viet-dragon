"use client";

import type { Document } from "@/lib/content/editor/api";
import { groupLines, isLongText, leafPaths, lineLabel, setMessageText, textOf, type MessageData } from "@/lib/content/editor/message-tree";
import { icuArguments } from "@/lib/content/icu";
import { useEditor } from "../editor-context";
import { TextField } from "../fields";
import { FormCard, KeyBadge } from "./form-card";

// The wording of one part of the website's interface (a namespace of `messages/<language>.json`) in the language being edited.
// The structure is the site's — no line is added, removed or reordered here, only reworded — so the form is one box per text the
// namespace already has. Under each box: the Vietnamese text to translate from, and the `{variables}` the text must keep.

const TOP_LEVEL = "Nội dung chung";
const TALL_ROWS = 3;

function MessageLine({ path }: Readonly<{ path: string }>) {
  const editor = useEditor();
  const data = (editor.document.data ?? {}) as MessageData;
  const vietnamese = textOf(data, "vi", path);
  const variables = [...(icuArguments(vietnamese) ?? [])].map((name) => `{${name}}`);
  const hint = [
    editor.language !== "vi" && vietnamese ? `Tiếng Việt: ${vietnamese}` : null,
    variables.length > 0 ? `Giữ nguyên ${variables.join(", ")} trong câu.` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <TextField
      path={`data.*.${path}`}
      registryPath="data.*.*"
      label={lineLabel(path)}
      multiline={isLongText(vietnamese || textOf(data, "en", path))}
      rows={TALL_ROWS}
      hint={hint || undefined}
      onText={(text) => editor.replace(setMessageText(editor.document as { data?: MessageData }, editor.language, path, text) as unknown as Document)}
    />
  );
}

export function SiteMessageForm() {
  const { document } = useEditor();
  const groups = groupLines(leafPaths((document.data ?? {}) as MessageData));

  return (
    <>
      <div className="px-1"><KeyBadge label="Mã nhóm văn bản" value={String(document.key ?? "")} /></div>
      {groups.map(({ group, paths }) => (
        <FormCard key={group} title={group || TOP_LEVEL} columns={1}>
          {paths.map((path) => (
            <MessageLine key={path} path={path} />
          ))}
        </FormCard>
      ))}
    </>
  );
}
