"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { createContentApi, type MediaRow } from "@/lib/content/editor/api";
import { DEFAULT_MAX_UPLOAD_BYTES, emptyQueue, isUploading, nextToUpload, progressOf, uploadQueueReducer } from "@/lib/content/editor/media-upload";

// Runs the upload queue (lib/content/editor/media-upload.ts is the state machine): files are checked when they are added, then sent one at a
// time. `onUploaded` hears of every file that reached the library — also one that was already there — in the order they finish.

type Options = {
  /** The server's limit, once the library list has said it. */
  maxBytes: number | undefined;
  onUploaded: (item: MediaRow, existing: boolean) => void;
};

export function useMediaUpload({ maxBytes, onUploaded }: Options) {
  const api = useMemo(() => createContentApi(), []);
  const [queue, dispatch] = useReducer(uploadQueueReducer, emptyQueue);
  // The File objects are kept beside the queue under the ids the queue knows them by (the reducer only needs their name, size and type).
  const files = useRef(new Map<number, File>());
  const counter = useRef(1);
  const sending = useRef(new Set<number>());

  const add = useCallback(
    (list: Iterable<File>) => {
      const added = [...list];
      if (added.length === 0) return;
      const firstId = counter.current;
      counter.current += added.length;
      added.forEach((file, index) => files.current.set(firstId + index, file));
      dispatch({ type: "added", files: added, maxBytes: maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES, firstId });
    },
    [maxBytes],
  );

  // `sending` keeps a development double-run of the effect below from sending a file twice.
  const send = useCallback(
    (id: number) => {
      const file = files.current.get(id);
      if (!file || sending.current.has(id)) return;
      sending.current.add(id);
      dispatch({ type: "started", id });
      void api.uploadMedia(file).then((result) => {
        files.current.delete(id);
        if (result.ok) {
          dispatch({ type: "succeeded", id, item: result.data.item, existing: result.data.existing });
          onUploaded(result.data.item, result.data.existing);
        } else dispatch({ type: "failed", id, message: `«${file.name}»: ${result.problem.message}` });
      });
    },
    [api, onUploaded],
  );

  // The next waiting file goes out as soon as nothing is in flight.
  const nextId = nextToUpload(queue)?.id;
  useEffect(() => {
    if (nextId !== undefined) send(nextId);
  }, [nextId, send]);

  return { entries: queue.entries, busy: isUploading(queue), progress: progressOf(queue), add, clear: () => dispatch({ type: "cleared" }) };
}
