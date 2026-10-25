import { describe, expect, it } from "vitest";
import type { MediaRow } from "./api";
import { checkFile, emptyQueue, formatBytes, isUploading, nextToUpload, progressOf, uploadQueueReducer, type CandidateFile, type UploadAction, type UploadQueue } from "./media-upload";

const MEGABYTE = 1024 * 1024;
const MAX = 10 * MEGABYTE;
const file = (name: string, size = 1000, type = "image/jpeg"): CandidateFile => ({ name, size, type });
const row = (key: string): MediaRow => ({ key, source: "upload", kind: "image", mime: "image/webp", width: 10, height: 10, bytes: 99, alt: null, createdAt: "2026-10-25T00:00:00.000Z" });
const run = (actions: UploadAction[], from: UploadQueue = emptyQueue): UploadQueue => actions.reduce(uploadQueueReducer, from);

describe("formatBytes", () => {
  it.each([
    [1, "1 KB"],
    [850 * 1024, "850 KB"],
    [MEGABYTE, "1 MB"],
    [1.5 * MEGABYTE, "1,5 MB"],
    [12.34 * MEGABYTE, "12,3 MB"],
    [10 * MEGABYTE, "10 MB"],
    [10.04 * MEGABYTE, "10 MB"],
    [9.96 * MEGABYTE, "10 MB"],
  ])("%d → %s", (bytes, text) => {
    expect(formatBytes(bytes)).toBe(text);
  });
});

describe("checkFile — what can only fail is not sent", () => {
  it("lets an ordinary photo through", () => {
    expect(checkFile(file("a.jpg", 3 * MEGABYTE), MAX)).toBeNull();
    for (const type of ["image/png", "image/webp", "image/avif", "image/gif"]) expect(checkFile(file("a", 5, type), MAX)).toBeNull();
  });

  it("lets a file of exactly the cap through, and refuses one byte more, naming both sizes", () => {
    expect(checkFile(file("a.jpg", MAX), MAX)).toBeNull();
    const message = checkFile(file("Poster to.jpg", MAX + 1), MAX);
    expect(message).toContain("«Poster to.jpg»");
    expect(message).toContain("10 MB");
    expect(message).toContain("giới hạn");
  });

  it("refuses an empty file", () => {
    expect(checkFile(file("a.jpg", 0), MAX)).toContain("trống");
  });

  it("refuses an SVG with its reason, and other types that are not photos", () => {
    expect(checkFile(file("logo.svg", 200, "image/svg+xml"), MAX)).toContain("SVG");
    for (const type of ["application/pdf", "text/html", "video/mp4", "image/heic", "image/tiff", "application/zip"]) {
      expect(checkFile(file("x", 200, type), MAX), type).toContain("không phải ảnh được hỗ trợ");
    }
  });

  it("leaves a file whose type the browser does not know to the server (AVIF in some browsers)", () => {
    expect(checkFile(file("photo.avif", 200, ""), MAX)).toBeNull();
  });

  it("is not fooled by a name: only the size and the claimed type are read", () => {
    expect(checkFile(file("evil.jpg", 200, "text/html"), MAX)).not.toBeNull();
  });
});

describe("the upload queue", () => {
  it("starts empty and idle", () => {
    expect(emptyQueue.entries).toEqual([]);
    expect(isUploading(emptyQueue)).toBe(false);
    expect(nextToUpload(emptyQueue)).toBeUndefined();
  });

  it("queues the files that can go and finishes the ones that cannot, at once and with their reason", () => {
    const queue = run([{ type: "added", files: [file("a.jpg"), file("huge.jpg", MAX * 2), file("b.png", 500, "image/png")], maxBytes: MAX, firstId: 1 }]);
    expect(queue.entries.map((entry) => [entry.id, entry.name, entry.status])).toEqual([
      [1, "a.jpg", "waiting"],
      [2, "huge.jpg", "failed"],
      [3, "b.png", "waiting"],
    ]);
    expect(queue.entries[1].message).toContain("vượt giới hạn");
    expect(progressOf(queue)).toEqual({ finished: 1, total: 3 });
  });

  it("sends one at a time, in order, and a failure does not stop the rest", () => {
    let queue = run([{ type: "added", files: [file("a.jpg"), file("b.jpg"), file("c.jpg")], maxBytes: MAX, firstId: 1 }]);
    expect(nextToUpload(queue)?.name).toBe("a.jpg");

    queue = run([{ type: "started", id: 1 }], queue);
    expect(nextToUpload(queue)).toBeUndefined(); // a is in flight: nothing else goes yet
    expect(isUploading(queue)).toBe(true);

    queue = run([{ type: "failed", id: 1, message: "Ảnh hỏng." }], queue);
    expect(nextToUpload(queue)?.name).toBe("b.jpg");
    queue = run([{ type: "started", id: 2 }, { type: "succeeded", id: 2, item: row("uploads/2026/b-00000001.webp"), existing: false }], queue);
    expect(nextToUpload(queue)?.name).toBe("c.jpg");
    queue = run([{ type: "started", id: 3 }, { type: "succeeded", id: 3, item: row("uploads/2026/b-00000001.webp"), existing: true }], queue);

    expect(queue.entries.map((entry) => entry.status)).toEqual(["failed", "done", "done"]);
    expect(queue.entries[0].message).toBe("Ảnh hỏng.");
    expect(queue.entries[1]).toMatchObject({ existing: false, item: { key: "uploads/2026/b-00000001.webp" } });
    expect(queue.entries[2].existing).toBe(true);
    expect(isUploading(queue)).toBe(false);
    expect(nextToUpload(queue)).toBeUndefined();
    expect(progressOf(queue)).toEqual({ finished: 3, total: 3 });
  });

  it("ignores results that arrive for a line in the wrong state", () => {
    const queue = run([{ type: "added", files: [file("a.jpg")], maxBytes: MAX, firstId: 1 }]);
    expect(run([{ type: "succeeded", id: 1, item: row("k"), existing: false }], queue).entries[0].status).toBe("waiting");
    expect(run([{ type: "failed", id: 1, message: "x" }], queue).entries[0].status).toBe("waiting");
    const done = run([{ type: "started", id: 1 }, { type: "succeeded", id: 1, item: row("k"), existing: false }], queue);
    expect(run([{ type: "started", id: 1 }], done).entries[0].status).toBe("done");
    expect(run([{ type: "failed", id: 1, message: "late" }], done).entries[0].status).toBe("done");
    expect(run([{ type: "started", id: 99 }], queue)).toEqual(queue);
  });

  it("clears the finished lines but keeps what is still on its way (ids are the caller's, so they keep counting)", () => {
    let queue = run([{ type: "added", files: [file("a.jpg"), file("b.jpg"), file("c.jpg", MAX * 2)], maxBytes: MAX, firstId: 1 }, { type: "started", id: 1 }, { type: "succeeded", id: 1, item: row("k"), existing: false }, { type: "started", id: 2 }]);
    queue = run([{ type: "cleared" }], queue);
    expect(queue.entries.map((entry) => [entry.name, entry.status])).toEqual([["b.jpg", "uploading"]]);
    queue = run([{ type: "added", files: [file("d.jpg")], maxBytes: MAX, firstId: 4 }], queue);
    expect(queue.entries.map((entry) => entry.id)).toEqual([2, 4]);
  });

  it("adding more files while one is in flight queues them behind it", () => {
    let queue = run([{ type: "added", files: [file("a.jpg")], maxBytes: MAX, firstId: 1 }, { type: "started", id: 1 }]);
    queue = run([{ type: "added", files: [file("b.jpg")], maxBytes: MAX, firstId: 2 }], queue);
    expect(nextToUpload(queue)).toBeUndefined();
    queue = run([{ type: "succeeded", id: 1, item: row("k"), existing: false }], queue);
    expect(nextToUpload(queue)?.name).toBe("b.jpg");
  });
});
