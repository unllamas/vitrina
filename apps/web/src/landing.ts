import type { BusinessProfile, LandingPage, MarketingKit, OpeningHours, Review } from "./types.ts";

/**
 * Arma la landing a partir de la ficha. Los nombres salen de `types.ts`
 * (los mismos que llena `mapPlace`). Si un dato no está, la sección se omite:
 * no se inventan reseñas, puntajes, horarios ni fotos.
 *
 * «Abierto ahora» se calcula al render, en America/Argentina/Mendoza,
 * solo con `hours.periods` (día 0 = domingo, como Places).
 */
export const MENDOZA_TIME_ZONE = "America/Argentina/Mendoza";

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const PLACES = ["Chacras de Coria", "Luján de Cuyo", "Godoy Cruz", "Maipú", "Guaymallén", "Las Heras"] as const;
const PREFILL_MAX = 100;

type Period = OpeningHours["periods"][number];

export interface RatingHook {
  label: string;
  href: string;
}

export interface LandingView {
  name: string;
  category: string;
  keyword: string;
  locality: string;
  headline: string;
  summary: string;
  cta: string;
  ctaNote: string;
  prefill: string;
  whatsappUrl: string | null;
  phoneUrl: string | null;
  contactLabel: string | null;
  directionsUrl: string;
  mapEmbedUrl: string | null;
  address: string;
  street: string;
  phoneLine: string | null;
  phoneKind: "phone" | "whatsapp" | null;
  ratingHook: RatingHook | null;
  openLabel: string | null;
  todayHours: string | null;
  hoursText: string | null;
  benefits: string[];
  benefitsHeading: string;
  looseQuote: Review | null;
  reviewBlock: Review[] | null;
  photos: { url: string; alt: string }[];
  titleTag: string;
  metaDescription: string;
  schema: Record<string, unknown>;
}

export function presentLanding(kit: MarketingKit, now: Date = new Date()): LandingView {
  const { business, landing } = kit;
  const locality = resolveLocality(business);
  const keyword = business.category.trim() || "Comercio";
  const headline = resolveHeadline(landing.headline, business.name, keyword, locality);
  const proof = proofReviews(landing.testimonials.length > 0 ? landing.testimonials : business.reviews);
  const periods = business.hours?.periods ?? [];
  const hoursText = hoursCopy(business.hours);
  const hasHours = Boolean(hoursText || periods.length > 0);
  const open = openingState(business.hours, now);
  const ratingHook = buildRatingHook(business);
  const prefill = landing.whatsappPrefill?.trim() || defaultPrefill(business.name, business.category);
  const whatsappUrl = whatsappLink(business.whatsapp, prefill);
  const phoneUrl = telLink(business.phone);
  const directionsUrl = business.mapsUrl?.trim() || business.sourceUrl.trim() || mapsSearch(business.address);
  const benefits = deriveBenefits(landing, business, proof, keyword, locality);
  const point = business.geo ?? business.location ?? null;

  return {
    name: business.name,
    category: business.category,
    keyword,
    locality,
    headline,
    summary: landing.summary,
    cta: landing.whatsappCta,
    ctaNote: hasHours ? "Te respondemos en el horario de atención." : "Escribinos y te confirmamos horarios.",
    prefill,
    whatsappUrl,
    phoneUrl,
    contactLabel: whatsappUrl ? landing.whatsappCta : phoneUrl ? "Llamar" : null,
    directionsUrl,
    mapEmbedUrl: mapEmbed(point),
    address: business.address,
    street: streetFrom(business.address),
    phoneLine: business.phone?.trim() || business.whatsapp.trim() || null,
    phoneKind: business.phone?.trim() ? "phone" : business.whatsapp.trim() ? "whatsapp" : null,
    ratingHook,
    openLabel: open ? openLabel(open) : null,
    todayHours: periods.length > 0 ? todayHours(periods, now) : null,
    hoursText,
    benefits,
    benefitsHeading: `Por qué pedir en ${locality}`,
    looseQuote: proof.length > 0 && proof.length < 3 ? (proof[0] ?? null) : null,
    reviewBlock: proof.length >= 3 ? proof.slice(0, 4) : null,
    photos: (business.photos ?? [])
      .filter((photo) => photo.url.trim())
      .slice(0, 6)
      .map((photo, index) => ({ url: photo.url, alt: `Foto ${index + 1} de ${business.name}` })),
    titleTag: resolveTitle(landing.titleTag, headline, keyword, locality, business.name),
    metaDescription: resolveMeta(landing, keyword, locality, proof, ratingHook ? (business.rating ?? null) : null),
    schema: buildSchema(business, landing, locality, periods),
  };
}

/** Día de Places: 0 domingo … 6 sábado. Sin períodos no hay pastilla. */
export function openingState(hours: OpeningHours | undefined, now: Date): { open: boolean; until: string | null } | null {
  const periods = hours?.periods ?? [];
  if (periods.length === 0) return null;
  const clock = mendozaClock(now);
  for (const period of periods) {
    const hit = matchPeriod(clock, period);
    if (hit?.open) return hit;
  }
  return { open: false, until: null };
}

export function resolveLocality(business: Pick<BusinessProfile, "locality" | "address">): string {
  const explicit = business.locality?.trim();
  if (explicit) return explicit;
  const address = business.address.toLocaleLowerCase("es");
  for (const place of PLACES) {
    if (address.includes(place.toLocaleLowerCase("es"))) return place;
  }
  return "Mendoza";
}

function resolveHeadline(headline: string, name: string, keyword: string, locality: string): string {
  const authored = headline.trim();
  if (authored && authored !== name.trim()) return authored;
  if (keyword && locality) return `${keyword} en ${locality}`;
  return authored || name;
}

function proofReviews(reviews: Review[]): Review[] {
  const rated = reviews.filter((review) => typeof review.rating === "number");
  const source = rated.length > 0 ? rated.filter((review) => (review.rating ?? 0) >= 4) : reviews;
  return source.map((review) => ({ ...review, text: excerpt(review.text) })).filter((review) => review.text);
}

function deriveBenefits(landing: LandingPage, business: BusinessProfile, reviews: Review[], keyword: string, locality: string): string[] {
  const authored = (landing.benefits ?? []).map((benefit) => benefit.trim()).filter(Boolean);
  if (authored.length > 0) return authored.slice(0, 3);
  const lines: string[] = [];
  for (const review of reviews.slice(0, 2)) lines.push(firstSentence(review.text));
  lines.push(business.address ? `${keyword} en ${locality}. ${business.address}` : `${keyword} en ${locality}.`);
  for (const service of business.services ?? []) {
    const clean = service.trim();
    if (clean && clean.toLocaleLowerCase("es") !== keyword.toLocaleLowerCase("es")) lines.push(clean);
  }
  if (lines.filter(Boolean).length < 3) {
    lines.push(`Escribí por WhatsApp. El mensaje nombra a ${business.name} y lo podés editar.`);
  }
  return unique(lines).slice(0, 3);
}

function buildRatingHook(business: BusinessProfile): RatingHook | null {
  if (business.rating == null || business.reviewCount == null || business.rating < 4 || business.reviewCount <= 0) return null;
  const href = business.mapsUrl?.trim() || business.sourceUrl.trim();
  if (!href) return null;
  const noun = business.reviewCount === 1 ? "reseña" : "reseñas";
  return { label: `★ ${formatRating(business.rating)} en Google · ${business.reviewCount} ${noun}`, href };
}

function resolveTitle(explicit: string | undefined, headline: string, keyword: string, locality: string, name: string): string {
  const given = explicit?.trim();
  if (given && given !== headline) return given;
  const short = name.replace(new RegExp(`^${escapeRegExp(keyword)}\\s+`, "i"), "").trim() || name;
  const options = [
    `${keyword} en ${locality}, Mendoza | ${name}`,
    `${keyword} en ${locality}, Mendoza | ${short}`,
    `${keyword} en ${locality} | ${name}`,
  ].filter((option) => option !== headline);
  return pickLength(options, 50, 60);
}

function resolveMeta(landing: LandingPage, keyword: string, locality: string, reviews: Review[], rating: number | null): string {
  const given = landing.metaDescription?.trim();
  if (given) return given;
  const bits = [`${keyword} en ${locality}, Mendoza.`];
  const extras = reviews.slice(0, 2).map((review) => ensurePeriod(firstSentence(review.text)));
  if (extras.length > 0) bits.push(...extras);
  else if (landing.summary.trim()) bits.push(ensurePeriod(firstSentence(landing.summary)));
  if (rating != null) bits.push(`${formatRating(rating)} en Google.`);
  return joinWithin(bits, ensurePeriod(landing.whatsappCta), 155);
}

function buildSchema(business: BusinessProfile, landing: LandingPage, locality: string, periods: Period[]): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": landing.schemaType?.trim() || schemaTypeFor(business.category),
    name: business.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: streetFrom(business.address),
      addressLocality: locality,
      addressRegion: "Mendoza",
      addressCountry: "AR",
    },
  };
  const telephone = schemaPhone(business.phone || business.whatsapp);
  if (telephone) schema.telephone = telephone;
  if (business.website?.trim()) schema.url = business.website.trim();
  if (business.sourceUrl.trim()) schema.sameAs = [business.sourceUrl.trim()];
  const image = business.photos?.find((photo) => photo.url.trim())?.url;
  if (image) schema.image = image;
  const point = business.geo ?? business.location;
  if (point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude)) {
    schema.geo = { "@type": "GeoCoordinates", latitude: point.latitude, longitude: point.longitude };
  }
  const specs = periods
    .filter((period) => period.close && period.close.day === period.open.day && SCHEMA_DAYS[period.open.day])
    .map((period) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[period.open.day],
      opens: padTime(period.open.hour, period.open.minute),
      closes: padTime(period.close?.hour ?? 0, period.close?.minute ?? 0),
    }));
  if (specs.length > 0) schema.openingHoursSpecification = specs;
  return schema;
}

function schemaTypeFor(category: string): string {
  const value = category.toLocaleLowerCase("es");
  if (/caf[eé]|coffee/.test(value)) return "CafeOrCoffeeShop";
  if (/bodega|winery/.test(value)) return "Winery";
  if (/peluq|hair/.test(value)) return "HairSalon";
  if (/panad|bakery/.test(value)) return "Bakery";
  if (/restaur/.test(value)) return "Restaurant";
  if (/(^|[^a-záéíóúüñ])bar([^a-záéíóúüñ]|$)/.test(value)) return "BarOrPub";
  if (/spa/.test(value)) return "DaySpa";
  return "LocalBusiness";
}

function hoursCopy(hours: OpeningHours | undefined): string | null {
  const lines = (hours?.weekdayDescriptions ?? []).map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 ? lines.join("\n") : null;
}

function todayHours(periods: Period[], now: Date): string {
  const clock = mendozaClock(now);
  const ranges = periods
    .filter((period) => period.open.day === clock.day)
    .map((period) => {
      const start = formatClock(period.open.hour, period.open.minute);
      if (!period.close || period.close.day !== period.open.day) return `desde las ${formatClock(period.open.hour, period.open.minute)}`;
      return `${start} a ${formatClock(period.close.hour, period.close.minute)}`;
    });
  if (ranges.length === 0) return "Hoy cerrado";
  if (ranges.length === 1 && ranges[0]?.startsWith("desde")) return `Hoy ${ranges[0]}`;
  return `Hoy de ${ranges.join(" y de ")}`;
}

function matchPeriod(clock: { day: number; minutes: number }, period: Period): { open: boolean; until: string | null } | null {
  const openMinutes = period.open.hour * 60 + period.open.minute;
  const close = period.close;
  if (!close) {
    if (clock.day === period.open.day && clock.minutes >= openMinutes) return { open: true, until: null };
    return null;
  }
  const closeMinutes = close.hour * 60 + close.minute;
  const until = formatUntil(closeMinutes);
  if (period.open.day === close.day) {
    if (clock.day === period.open.day && clock.minutes >= openMinutes && clock.minutes < closeMinutes) return { open: true, until };
    return null;
  }
  if (clock.day === period.open.day && clock.minutes >= openMinutes) return { open: true, until };
  if (clock.day === close.day && clock.minutes < closeMinutes) return { open: true, until };
  return null;
}

function openLabel(state: { open: boolean; until: string | null }): string {
  if (state.open && state.until) return `Abierto ahora, hasta las ${state.until}`;
  if (state.open) return "Abierto ahora";
  return "Cerrado ahora";
}

function mendozaClock(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MENDOZA_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  let hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  if (hour === 24) hour = 0;
  return { day: day >= 0 ? day : 0, minutes: hour * 60 + minute };
}

function defaultPrefill(name: string, category: string): string {
  const kind = schemaTypeFor(category);
  const lines =
    kind === "CafeOrCoffeeShop"
      ? [`Hola, vi la página de ${name} y quiero reservar mesa para _ personas el _.`]
      : kind === "Winery"
        ? [`Hola, quiero coordinar una visita a ${name}. Preferiría el día _.`]
        : kind === "HairSalon"
          ? [`Hola, quiero sacar turno en ${name}. ¿Qué día tienen?`]
          : kind === "Bakery"
            ? [`Hola, vi la página de ${name} y quiero pedir para el día _.`]
            : [`Hola, vi la página de ${name} y quiero consultar por el día _.`];
  return lines.find((line) => line.length <= PREFILL_MAX) ?? "Hola, quiero consultar para el día _.";
}

function whatsappLink(raw: string, prefill: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(prefill)}`;
}

function telLink(raw: string | null | undefined): string | null {
  const digits = raw?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  return `tel:+${digits}`;
}

function schemaPhone(raw: string | null | undefined): string | null {
  const digits = raw?.replace(/\D/g, "") ?? "";
  return digits ? `+${digits}` : null;
}

function mapEmbed(point: { latitude: number; longitude: number } | null): string | null {
  if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return null;
  return `https://www.google.com/maps?q=${point.latitude},${point.longitude}&z=16&output=embed`;
}

function mapsSearch(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function streetFrom(address: string): string {
  return address.split(",")[0]?.trim() || address.trim();
}

function excerpt(text: string): string {
  const parts = text.match(/[^.!?]+[.!?]+/g)?.map((part) => part.trim()) ?? [];
  if (parts.length <= 2) return text.trim();
  return parts.slice(0, 2).join(" ");
}

function firstSentence(text: string): string {
  return (
    text
      .trim()
      .match(/^[^.!?]+[.!?]?/)?.[0]
      ?.trim() || text.trim()
  );
}

function ensurePeriod(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function formatRating(value: number): string {
  return value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatClock(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

function formatUntil(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return minute === 0 ? String(hour) : `${hour}:${String(minute).padStart(2, "0")}`;
}

function padTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

function pickLength(options: string[], min: number, max: number): string {
  const fitting = options.filter((option) => option.length <= max);
  return (
    fitting.find((option) => option.length >= min) ??
    fitting.sort((a, b) => b.length - a.length)[0] ??
    options[0]?.slice(0, max).trim() ??
    ""
  );
}

function joinWithin(bits: string[], cta: string, max: number): string {
  const body = [...bits];
  while (body.length > 1 && `${body.join(" ")} ${cta}`.length > max) body.pop();
  const text = `${body.join(" ")} ${cta}`;
  if (text.length <= max) return text;
  const room = Math.max(max - cta.length - 1, 0);
  const cut = (body[0] ?? "")
    .slice(0, room)
    .replace(/\s+\S*$/, "")
    .trim();
  return `${cut} ${cta}`.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
