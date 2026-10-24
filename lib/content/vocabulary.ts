import type { VocabOption, Vocabulary } from "./editor/vocabulary";
import type { DbExecutor } from "@/lib/db/types";
import { listSummaries } from "./summaries";

/** The lists an editor picks from (categories, materials, units…), as options labelled in Vietnamese. */
export async function loadVocabulary(x: DbExecutor, kinds: readonly (keyof Vocabulary)[]): Promise<Vocabulary> {
  const vocabulary: Vocabulary = {};
  for (const kind of kinds) {
    const options: VocabOption[] = (await listSummaries(x, kind))
      .filter((row) => row.version !== null)
      .map((row) => ({ value: row.ref.id, label: row.label ?? row.ref.id }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
    vocabulary[kind] = options;
  }
  return vocabulary;
}
