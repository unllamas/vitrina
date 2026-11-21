import type { AdChannel, AdIdea, BrandKit, BusinessProfile } from "@/types.ts";

import { BrandPoster, posterLine } from "./brand-poster.tsx";
import { brandRoles, readableInk } from "./brand-style.ts";

const channelLabel: Record<AdChannel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  "google-ads": "Google Ads",
};

export function AdList({ ads, business, brand }: { ads: AdIdea[]; business: BusinessProfile; brand: BrandKit }) {
  return (
    <ol className="flex flex-col gap-16">
      {ads.map((ad, index) => (
        <li key={ad.id} className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {ad.channel === "instagram" ? <InstagramAd ad={ad} business={business} brand={brand} index={index} /> : null}
            {ad.channel === "facebook" ? <FacebookAd ad={ad} business={business} brand={brand} index={index} /> : null}
            {ad.channel === "google-ads" ? <GoogleAd ad={ad} business={business} /> : null}
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
            <Meta label="Canal" value={channelLabel[ad.channel]} />
            <Meta label="Objetivo" value={ad.objective} />
            <Meta label="Público" value={ad.audience} />
            <Meta label="CTA" value={ad.cta} />
            <Meta label="Pieza" value={ad.visual} />
          </dl>
        </li>
      ))}
    </ol>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-pretty">{value}</dd>
    </div>
  );
}

function InstagramAd({ ad, business, brand, index }: { ad: AdIdea; business: BusinessProfile; brand: BrandKit; index: number }) {
  return (
    <div>
      <ProfileRow business={business} brand={brand} />
      <div className="aspect-square">
        <BrandPoster brand={brand} index={index + 2} headline={posterLine(ad.copy)} />
      </div>
      <div className="flex min-h-11 items-center justify-between border-t border-line px-3 text-sm font-medium" aria-hidden="true">
        <span>{ad.cta}</span>
        <Chevron />
      </div>
      <p className="px-3 py-3 text-sm leading-relaxed text-pretty">
        <span className="font-medium">{business.name}</span> {ad.copy}
      </p>
    </div>
  );
}

function FacebookAd({ ad, business, brand, index }: { ad: AdIdea; business: BusinessProfile; brand: BrandKit; index: number }) {
  return (
    <div>
      <ProfileRow business={business} brand={brand} />
      <p className="px-3 pb-3 text-sm leading-relaxed text-pretty">{ad.copy}</p>
      <div className="aspect-[4/3]">
        <BrandPoster brand={brand} index={index + 4} headline={posterLine(ad.visual)} />
      </div>
      <div className="flex min-h-11 items-center justify-between gap-3 bg-mist px-3">
        <p className="min-w-0 truncate text-xs text-muted">{business.category}</p>
        <span className="inline-flex min-h-9 items-center rounded-md bg-surface px-3 text-sm font-medium" aria-hidden="true">
          {ad.cta}
        </span>
      </div>
    </div>
  );
}

function GoogleAd({ ad, business }: { ad: AdIdea; business: BusinessProfile }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-xs text-muted">Publicidad · {business.category || "Ficha de Google"}</p>
      <p className="text-lg leading-snug text-[#1a0dab]">{business.name}</p>
      <p className="text-sm leading-relaxed text-pretty">{ad.copy}</p>
      <p className="text-sm text-muted">{business.address}</p>
      <p className="pt-1 text-sm font-medium text-[#1a0dab]">{ad.cta}</p>
    </div>
  );
}

function ProfileRow({ business, brand }: { business: BusinessProfile; brand: BrandKit }) {
  const roles = brandRoles(brand);
  return (
    <div className="flex items-center gap-3 px-3 py-3" aria-hidden="true">
      <span
        className="flex size-9 items-center justify-center rounded-full text-xs font-medium"
        style={{ background: roles.ink, color: readableInk(roles.ink) }}
      >
        {brand.logo.initials}
      </span>
      <span>
        <span className="block text-sm font-medium">{business.name}</span>
        <span className="block text-xs text-muted">Publicidad</span>
      </span>
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
