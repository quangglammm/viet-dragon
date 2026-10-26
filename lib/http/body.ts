// Reading a request body without trusting its sender. A body is read through a cap: the declared length is checked first (cheap, and enough
// for an honest client), then the stream itself is counted — a client may lie about its length or send none at all.

export class BodyTooLarge extends Error {
  constructor(readonly limit: number) {
    super(`the request body is larger than ${limit} bytes`);
    this.name = "BodyTooLarge";
  }
}

/** At most `limit` bytes of the body; throws `BodyTooLarge` beyond that (and stops reading). An absent body is empty. */
export async function readBodyCapped(request: Request, limit: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new BodyTooLarge(limit);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new BodyTooLarge(limit);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
