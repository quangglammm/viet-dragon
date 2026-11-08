import Image from "next/image";
import { cn } from "@/lib/utils";
import { showcaseSlotsOf, type ShowcaseCard } from "@/lib/content/read/merchandising";

// The editorial gallery on /products. Every picture is a row of the content database; on a phone they all show in a 2-column grid, on a
// desktop the layout takes one picture per slot by its aspect (tall → the left column, square → the two stacked on the right, wide → the
// bottom row): see `showcaseSlotsOf`.

const OVERLAY = "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent";

function Picture({ card, sizes, overlay, labelClass }: Readonly<{ card: ShowcaseCard; sizes: string; overlay: string; labelClass: string }>) {
  return (
    <div className="relative rounded-2xl overflow-hidden group">
      <Image src={card.src} alt={card.label} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={overlay} />
      <div className={labelClass}>
        <p className="text-white font-black text-sm">{card.label}</p>
      </div>
    </div>
  );
}

export function ShowcaseGallery({ cards, caption }: Readonly<{ cards: readonly ShowcaseCard[]; caption: string }>) {
  if (cards.length === 0) return null;
  const { tall, squares, wides } = showcaseSlotsOf(cards);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-16">
      {/* Mobile grid (< lg): simple 2-column with fixed card heights */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <div key={card.uid} className={`relative rounded-2xl overflow-hidden group ${i === 0 ? "col-span-2 h-52" : "h-40"}`}>
            <Image src={card.src} alt={card.label} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className={OVERLAY} />
            <div className="absolute bottom-3 left-3">
              <p className="text-white font-black text-sm">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop editorial layout (lg+) */}
      <div className="hidden lg:block">
        {(tall || squares.length > 0) && (
          <div className="grid grid-cols-3 gap-3 h-[480px]">
            {tall && (
              <div className="col-span-1 relative rounded-2xl overflow-hidden group">
                <Image src={tall.src} alt={tall.label} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className={OVERLAY} />
                <div className="absolute bottom-5 left-5">
                  <p className="text-white font-black text-base">{tall.label}</p>
                </div>
              </div>
            )}
            {squares.length > 0 && (
              <div className={cn("grid grid-rows-2 gap-3", tall ? "col-span-2" : "col-span-3")}>
                {squares.map((card) => (
                  <Picture key={card.uid} card={card} sizes="66vw" overlay="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" labelClass="absolute bottom-4 left-5" />
                ))}
              </div>
            )}
          </div>
        )}

        {wides.length > 0 && (
          <div className={cn("grid gap-3 mt-3 h-[260px]", wides.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {wides.map((card) => (
              <Picture key={card.uid} card={card} sizes="50vw" overlay="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" labelClass="absolute bottom-4 left-5" />
            ))}
          </div>
        )}
      </div>

      {/* Gallery caption */}
      <p className="text-center text-xs text-zinc-400 mt-4">{caption}</p>
    </div>
  );
}
