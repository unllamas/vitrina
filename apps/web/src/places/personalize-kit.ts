import type { BusinessProfile, LandingPage, MarketingKit } from "@/types.ts";

function swap(text: string, from: string, to: string): string {
  if (!from || from === to) return text;
  return text.split(from).join(to);
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter((part) => part.length > 1);
  const letters = (parts.length > 0 ? parts : name.split(/\s+/)).slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase() || "V";
}

/** Deja el kit de plantilla, pero con el nombre, el rubro y los textos de la ficha real. `benefits` no se pisa. */
export function personalizeKit(
  kit: MarketingKit,
  business: BusinessProfile,
  landing?: Pick<LandingPage, "whatsappPrefill" | "titleTag" | "metaDescription" | "schemaType"> | null,
): MarketingKit {
  const previous = kit.business.name;
  const rename = (text: string) => swap(swap(text, previous, business.name), "La Esquina", business.name);
  return {
    ...kit,
    business,
    brand: { ...kit.brand, logo: { initials: initials(business.name), label: business.name } },
    landing: {
      ...kit.landing,
      headline: business.name,
      summary: [business.category, business.address].filter(Boolean).join(" · ") || rename(kit.landing.summary),
      testimonials: business.reviews.length > 0 ? business.reviews : kit.landing.testimonials,
      whatsappPrefill: landing?.whatsappPrefill ?? `Hola, vi ${business.name} y quiero consultar.`,
      titleTag: landing?.titleTag,
      metaDescription: landing?.metaDescription,
      schemaType: landing?.schemaType,
    },
    posts: kit.posts.map((post) => ({ ...post, caption: rename(post.caption), visual: rename(post.visual) })),
    ads: kit.ads.map((ad) => ({
      ...ad,
      copy: rename(ad.copy),
      visual: rename(ad.visual),
      audience: business.category ? `Gente que busca ${business.category.toLowerCase()}` : rename(ad.audience),
    })),
  };
}
