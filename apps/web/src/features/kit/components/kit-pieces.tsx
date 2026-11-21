import type { AdChannel, MarketingKit } from "@/types.ts";
import { brandSlots, fontName } from "@/variants.ts";

const channelLabel: Record<AdChannel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  "google-ads": "Google Ads",
};

function formatWhatsapp(digits: string): string {
  const local = digits.startsWith("549") ? digits.slice(3) : digits;
  if (local.length === 10) return `${local.slice(0, 3)} ${local.slice(3, 6)}-${local.slice(6)}`;
  return digits;
}

/** Landing con la paleta del comercio. Las reseñas se muestran tal cual llegaron. */
export function LandingPreview({ kit }: { kit: MarketingKit }) {
  const { fondo, acento, tinta } = brandSlots(kit.brand.palette);
  const display = fontName(kit, "Títulos");
  const body = fontName(kit, "Texto");
  const whatsapp = kit.business.whatsapp ? `https://wa.me/${kit.business.whatsapp}` : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-line" style={{ background: fondo.hex, color: tinta.hex }}>
      <div className="h-2" style={{ background: acento.hex }} />
      <div className="flex flex-col gap-4 px-4 py-5">
        <h3 className="text-3xl text-balance" style={{ fontFamily: `"${display}", serif` }}>
          {kit.landing.headline}
        </h3>
        <p className="text-pretty" style={{ fontFamily: `"${body}", sans-serif` }}>
          {kit.landing.summary}
        </p>
        {whatsapp ? (
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-base font-medium"
            style={{ background: tinta.hex, color: fondo.hex }}
            href={whatsapp}
          >
            {kit.landing.whatsappCta}
          </a>
        ) : null}
        <ul className="flex flex-col gap-3">
          {kit.landing.testimonials.map((review) => (
            <li key={`${review.author}-${review.text}`} className="border-t pt-3" style={{ borderColor: `${tinta.hex}22` }}>
              <p className="text-pretty">«{review.text}»</p>
              <p className="text-sm opacity-80">{review.author}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm">
          {kit.business.address}
          {kit.business.whatsapp ? <span className="block">WhatsApp {formatWhatsapp(kit.business.whatsapp)}</span> : null}
        </p>
      </div>
    </div>
  );
}

/** Grilla de 9. El color sale de la variante activa. */
export function PostGrid({ kit }: { kit: MarketingKit }) {
  const { fondo, acento, tinta } = brandSlots(kit.brand.palette);
  const display = fontName(kit, "Títulos");

  return (
    <ul className="grid grid-cols-3 gap-2">
      {kit.posts.map((post, index) => {
        const dark = index % 2 === 0;
        return (
          <li key={post.id}>
            <article
              className="relative aspect-square overflow-hidden rounded-xl p-2"
              style={{ background: dark ? tinta.hex : fondo.hex, color: dark ? fondo.hex : tinta.hex, fontFamily: `"${display}", serif` }}
            >
              <span aria-hidden="true" className="absolute -right-3 -bottom-5 size-16 rounded-full" style={{ background: acento.hex }} />
              <p className="relative line-clamp-6 text-[11px] leading-tight font-medium sm:text-sm">{post.caption}</p>
              <p className="sr-only">{post.visual}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/** La franja es la pieza visual. Objetivo, público, texto y CTA quedan abajo. */
export function AdList({ kit }: { kit: MarketingKit }) {
  const { fondo, acento, tinta } = brandSlots(kit.brand.palette);
  const display = fontName(kit, "Títulos");

  return (
    <ol className="flex flex-col gap-3">
      {kit.ads.map((ad) => (
        <li key={ad.id} className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="h-1.5" style={{ background: acento.hex }} />
          <div className="flex aspect-video flex-col justify-between p-4" style={{ background: fondo.hex, color: tinta.hex }}>
            <p className="text-sm font-medium">{channelLabel[ad.channel]}</p>
            <p className="text-2xl text-balance" style={{ fontFamily: `"${display}", serif` }}>
              {ad.cta}
            </p>
            <span
              className="inline-flex min-h-11 w-fit items-center rounded-full px-4 text-sm font-medium"
              style={{ background: tinta.hex, color: fondo.hex }}
            >
              {ad.cta}
            </span>
            <p className="sr-only">{ad.visual}</p>
          </div>
          <div className="flex flex-col gap-1 p-4">
            <p className="text-sm text-muted">{channelLabel[ad.channel]}</p>
            <p className="font-medium">{ad.objective}</p>
            <p className="text-pretty">{ad.copy}</p>
            <p className="text-sm text-muted">Público: {ad.audience}</p>
            <p className="text-sm text-muted">CTA: {ad.cta}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
