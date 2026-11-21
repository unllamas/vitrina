import type { BrandKit } from "@/types.ts";

import { brandColors, brandFont, colorAt, readableInk } from "./brand-style.ts";

export function posterLine(text: string): string {
  const sentence = text.split(/[.!?]/)[0]?.trim() || text.trim();
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length <= 6) return words.join(" ");
  return `${words.slice(0, 5).join(" ")}…`;
}

/** Pieza cuadrada con la paleta del comercio. El texto escala con el contenedor. */
export function BrandPoster({ brand, index, headline, kicker }: { brand: BrandKit; index: number; headline: string; kicker?: string }) {
  const colors = brandColors(brand);
  const background = colorAt(colors, index);
  const accent = colorAt(colors, index + 1);
  const ink = readableInk(background);
  const display = brandFont(brand, "Títulos", "Georgia, serif");
  const variant = index % 4;

  return (
    <div className="@container relative h-full w-full overflow-hidden" style={{ background, color: ink }}>
      {variant === 0 ? <div className="absolute -right-[18%] -top-[22%] size-[78%] rounded-full" style={{ background: accent }} /> : null}
      {variant === 1 ? <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: accent }} /> : null}
      {variant === 2 ? (
        <>
          <div className="absolute top-[16%] right-[10%] left-[10%] h-px opacity-40" style={{ background: ink }} />
          <div className="absolute right-[10%] bottom-[16%] left-[10%] h-px opacity-40" style={{ background: ink }} />
        </>
      ) : null}
      {variant === 3 ? <div className="absolute inset-y-0 left-0 w-[34%]" style={{ background: accent }} /> : null}
      <div
        className={`absolute flex flex-col ${variant === 1 || variant === 2 ? "top-[10%] justify-start" : "bottom-[8%] justify-end"} ${variant === 3 ? "right-[6%] left-[42%]" : "right-[7%] left-[7%]"}`}
      >
        {kicker ? <p className="line-clamp-3 text-[3.1cqw] leading-snug opacity-75">{kicker}</p> : null}
        <p className="mt-[3cqw] line-clamp-4 text-[7cqw] leading-[1.05] font-medium" style={{ fontFamily: display }}>
          {headline}
        </p>
      </div>
    </div>
  );
}
