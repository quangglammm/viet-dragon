import { HttpError } from "@/lib/content/http";
import { Invalid } from "@/lib/content/errors";
import { BodyTooLarge, readBodyCapped } from "@/lib/http/body";

// Reads the one file an upload request carries. The body is read through a cap (lib/http/body.ts) so a client cannot make the server buffer
// more than it agreed to, and only then is the form parsed.

const FILE_FIELD = "file";
/** What a multipart envelope (boundaries, the part's headers, the other fields) may add to the file itself. */
const ENVELOPE_ALLOWANCE = 64 * 1024;
const MEGABYTE = 1024 * 1024;

const tooLarge = (maxBytes: number) => new HttpError(413, "PAYLOAD_TOO_LARGE", `Ảnh quá lớn (tối đa ${Math.floor(maxBytes / MEGABYTE)} MB). Hãy thu nhỏ ảnh rồi tải lên lại.`);

export interface UploadedFile {
  bytes: Uint8Array;
  name: string;
}

/** The single `file` part of a multipart request, at most `maxBytes` long. Anything else in the form is refused. */
export async function readUploadedFile(request: Request, maxBytes: number): Promise<UploadedFile> {
  const body = await readBodyCapped(request, maxBytes + ENVELOPE_ALLOWANCE).catch((error: unknown) => {
    throw error instanceof BodyTooLarge ? tooLarge(maxBytes) : error;
  });
  let form: FormData;
  try {
    form = await new Response(body as BodyInit, { headers: { "content-type": request.headers.get("content-type") ?? "" } }).formData();
  } catch {
    throw new HttpError(400, "INVALID_FORM", "Không đọc được dữ liệu tải lên. Hãy thử lại.");
  }
  const entries = [...form.entries()];
  const files = entries.filter(([name]) => name === FILE_FIELD);
  if (files.length !== 1 || entries.length !== 1) throw new Invalid([{ path: FILE_FIELD, message: "Mỗi lần chỉ tải lên một ảnh, trong trường «file»." }]);
  const [, file] = files[0];
  if (typeof file === "string") throw new Invalid([{ path: FILE_FIELD, message: "Trường «file» phải là một tệp." }]);
  if (file.size > maxBytes) throw tooLarge(maxBytes);
  return { bytes: new Uint8Array(await file.arrayBuffer()), name: file.name };
}
