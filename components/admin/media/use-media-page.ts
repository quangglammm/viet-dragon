"use client";

import { useEffect, useMemo, useState } from "react";
import { createContentApi, type MediaPage } from "@/lib/content/editor/api";
import { MEDIA_PAGE_SIZE } from "@/lib/content/media-limits";

// One page of the library for a set of filters — what the image picker and the library page both draw. The answer is keyed by the request that
// produced it, so a slow answer to an old filter can never replace a newer one, and `loading` is simply "the answer is not for these filters yet".

export interface MediaFilters {
  /** Part of the file name. */
  q: string;
  /** `images/hero`; empty = every folder. */
  folder: string;
  /** Empty = the site's own files and the uploads. */
  source: "" | "static" | "upload";
  offset: number;
  /** A photo slot: videos are not offered. */
  imageOnly?: boolean;
}

type Loaded = { key: string; page: MediaPage | null; error: string | null };

export function useMediaPage({ q, folder, source, offset, imageOnly = false }: MediaFilters) {
  const api = useMemo(() => createContentApi(), []);
  const [reloads, setReloads] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const requestKey = JSON.stringify([q, folder, source, offset, imageOnly, reloads]);

  useEffect(() => {
    let cancelled = false;
    // What an editor manages (their uploads) is looked for newest first; the built-in files are a long list best read by name.
    void api.media({ q, folder, source: source || undefined, order: source === "upload" ? "newest" : "name", offset, limit: MEDIA_PAGE_SIZE, kind: imageOnly ? "image" : undefined }).then((result) => {
      if (cancelled) return;
      setLoaded({ key: requestKey, page: result.ok ? result.data : null, error: result.ok ? null : result.problem.message });
    });
    return () => {
      cancelled = true;
    };
  }, [api, q, folder, source, offset, imageOnly, requestKey]);

  return {
    page: loaded?.page ?? null,
    error: loaded?.key === requestKey ? loaded.error : null,
    loading: loaded?.key !== requestKey,
    /** Asks again (after an upload or a delete); the filters stay. */
    reload: () => setReloads((count) => count + 1),
  };
}
