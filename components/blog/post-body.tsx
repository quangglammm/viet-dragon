import type { Block, Inline } from "@/lib/content/read/markdown";
import { Link } from "@/i18n/navigation";

// A post's blocks (lib/content/read/markdown.ts) in the classes the article has always had. The blocks are data: no raw HTML reaches
// the page, and a link is already known to be on the address allow-list.

const HEADING_CLASSES = {
  2: "text-2xl font-black text-zinc-900 mt-10 mb-3",
  3: "text-xl font-black text-zinc-900 mt-8 mb-3",
  4: "text-lg font-bold text-zinc-900 mt-6 mb-2",
} as const;

function Inlines({ inlines }: Readonly<{ inlines: readonly Inline[] }>) {
  return (
    <>
      {inlines.map((inline, at) => {
        const key = `${at}:${inline.kind}`;
        if (inline.kind === "text") return inline.text;
        if (inline.kind === "strong") return <strong key={key} className="text-zinc-900 font-bold"><Inlines inlines={inline.children} /></strong>;
        if (inline.kind === "em") return <em key={key}><Inlines inlines={inline.children} /></em>;
        if (inline.href.startsWith("/")) return <Link key={key} href={inline.href} className="text-brand-primary underline underline-offset-2"><Inlines inlines={inline.children} /></Link>;
        const external = /^https?:/i.test(inline.href);
        return (
          <a key={key} href={inline.href} className="text-brand-primary underline underline-offset-2" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Inlines inlines={inline.children} />
          </a>
        );
      })}
    </>
  );
}

export function PostBody({ blocks }: Readonly<{ blocks: readonly Block[] }>) {
  return (
    <div className="prose prose-zinc prose-base max-w-none">
      {blocks.map((block, at) => {
        const key = `${at}:${block.kind}`;
        switch (block.kind) {
          case "heading": {
            const Tag = `h${block.level}` as const;
            return <Tag key={key} className={HEADING_CLASSES[block.level]}><Inlines inlines={block.inlines} /></Tag>;
          }
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={key} className={`text-zinc-600 leading-relaxed mb-4 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
                {block.items.map((item, index) => <li key={`${index}`}><Inlines inlines={item} /></li>)}
              </Tag>
            );
          }
          case "quote":
            return <blockquote key={key} className="border-l-4 border-zinc-200 pl-5 italic text-zinc-500 leading-relaxed mb-4"><Inlines inlines={block.inlines} /></blockquote>;
          default:
            return <p key={key} className="text-zinc-600 leading-relaxed mb-4"><Inlines inlines={block.inlines} /></p>;
        }
      })}
    </div>
  );
}
