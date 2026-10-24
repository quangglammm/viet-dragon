import { unstable_cache } from "next/cache";
import { getLogger } from "@/lib/logger";

// A read of the content database that the public pages share. Cached until a publish revalidates one of its tags (the admin API's
// `revalidateTag` after commit, lib/content/effects.ts); tag a read with `readTags(...)`, never by hand. `unstable_cache` is the
// supported API while the app does not use Cache Components; the cache lives in `.next/cache`, so it survives a restart — and a deploy,
// which is why every key carries the id of the build (inlined by next.config.ts): an entry holds what the code of ITS build computed.

const log = getLogger("content-read");
const BUILD = process.env.CONTENT_CACHE_BUILD ?? "unbuilt";

export function cachedRead<R>(name: string, tags: readonly string[], read: () => Promise<R>): () => Promise<R> {
  return unstable_cache(
    async () => {
      // Only a miss gets here: the line says what was rebuilt, and how long the database took.
      const started = Date.now();
      const result = await read();
      log.info({ read: name, ms: Date.now() - started }, "content read rebuilt");
      return result;
    },
    [name, BUILD],
    { tags: [...tags] },
  );
}
