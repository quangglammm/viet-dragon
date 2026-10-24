import { serializeJsonLd, type JsonLd as JsonLdData } from "@/lib/content/read/jsonld";

/** A schema.org JSON-LD block (or several). The text is escaped by `serializeJsonLd`, so nothing an editor wrote can end the tag. */
export function JsonLd({ data }: Readonly<{ data: JsonLdData | readonly JsonLdData[] }>) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
