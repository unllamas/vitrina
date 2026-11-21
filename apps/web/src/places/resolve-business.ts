import type { BusinessProfile, Review } from "@/types.ts";

import { followRedirects, type ParsedBusinessQuery, parseBusinessQuery } from "./parse-business-query.ts";

export interface BusinessLookup {
  source: "places" | "fixture";
  message: string | null;
  business: BusinessProfile | null;
  raw: unknown | null;
}

const PLACES = "https://places.googleapis.com/v1";
const FULL_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "primaryTypeDisplayName",
  "types",
  "location",
  "reviews",
  "photos",
  "googleMapsUri",
].join(",");
const BASIC_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "location",
  "primaryTypeDisplayName",
  "types",
  "googleMapsUri",
].join(",");

const FIXTURE = "Mostramos el kit de demostración.";
const NO_KEY = `No hay GOOGLE_PLACES_API_KEY. ${FIXTURE}`;
const NOT_FOUND = `No encontramos ese comercio en Google. ${FIXTURE}`;
const FAILED = `No pudimos consultar Google. ${FIXTURE}`;

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

interface PlaceText {
  text?: string;
}

interface PlaceReview {
  rating?: number;
  text?: PlaceText;
  originalText?: PlaceText;
  authorAttribution?: { displayName?: string };
}

interface PlacePhoto {
  name?: string;
}

interface PlaceResult {
  id?: string;
  displayName?: PlaceText;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  primaryTypeDisplayName?: PlaceText;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  reviews?: PlaceReview[];
  photos?: PlacePhoto[];
  googleMapsUri?: string;
}

function fixture(message: string): BusinessLookup {
  return { source: "fixture", message, business: null, raw: null };
}

function prefixed(mask: string): string {
  return mask
    .split(",")
    .map((field) => `places.${field}`)
    .join(",");
}

async function placesFetch(url: string, apiKey: string, init: RequestInit, fetchImpl: FetchLike): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Goog-Api-Key", apiKey);
  return fetchImpl(url, { ...init, headers, signal: AbortSignal.timeout(8000) });
}

async function readPlace(response: Response): Promise<PlaceResult | null> {
  if (!response.ok) return null;
  const body = (await response.json()) as { places?: PlaceResult[] } & PlaceResult;
  if (Array.isArray(body.places)) return body.places[0] ?? null;
  if (body.id || body.displayName) return body;
  return null;
}

async function searchPlace(parsed: ParsedBusinessQuery, apiKey: string, fetchImpl: FetchLike): Promise<PlaceResult | null> {
  if (parsed.placeId) {
    const details = await loadDetails(parsed.placeId, apiKey, fetchImpl);
    if (details) return details;
  }
  if (!parsed.textQuery) return null;

  const payload: Record<string, unknown> = { textQuery: parsed.textQuery, languageCode: "es", regionCode: "AR" };
  if (parsed.latitude !== null && parsed.longitude !== null) {
    payload.locationBias = {
      circle: { center: { latitude: parsed.latitude, longitude: parsed.longitude }, radius: 250 },
    };
  }

  for (const mask of [FULL_MASK, BASIC_MASK]) {
    const response = await placesFetch(
      `${PLACES}/places:searchText`,
      apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-FieldMask": prefixed(mask) },
        body: JSON.stringify(payload),
      },
      fetchImpl,
    );
    if (response.status === 400) {
      await response.text();
      continue;
    }
    if (response.status === 401 || response.status === 403) throw new Error(`Places ${response.status}`);
    return readPlace(response);
  }
  return null;
}

async function loadDetails(placeId: string, apiKey: string, fetchImpl: FetchLike): Promise<PlaceResult | null> {
  for (const mask of [FULL_MASK, BASIC_MASK]) {
    const response = await placesFetch(
      `${PLACES}/places/${encodeURIComponent(placeId)}?languageCode=es`,
      apiKey,
      { headers: { "X-Goog-FieldMask": mask } },
      fetchImpl,
    );
    if (response.status === 400) {
      await response.text();
      continue;
    }
    if (response.status === 401 || response.status === 403) throw new Error(`Places ${response.status}`);
    return readPlace(response);
  }
  return null;
}

async function photoUri(name: string, apiKey: string, fetchImpl: FetchLike): Promise<string | null> {
  const response = await placesFetch(`${PLACES}/${name}/media?maxWidthPx=800&skipHttpRedirect=true`, apiKey, {}, fetchImpl);
  if (!response.ok) return null;
  const body = (await response.json()) as { photoUri?: string };
  if (!body.photoUri || body.photoUri.includes(apiKey)) return null;
  return body.photoUri;
}

function reviewsOf(place: PlaceResult): Review[] {
  return (place.reviews ?? [])
    .map((review) => ({
      author: review.authorAttribution?.displayName ?? "Reseña",
      text: review.text?.text ?? review.originalText?.text ?? "",
      rating: typeof review.rating === "number" ? review.rating : undefined,
    }))
    .filter((review) => review.text)
    .slice(0, 5);
}

async function toProfile(place: PlaceResult, sourceUrl: string, apiKey: string, fetchImpl: FetchLike): Promise<BusinessProfile> {
  const name = place.displayName?.text?.trim() || "Comercio";
  const phone = place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? "";
  const photos: { uri: string }[] = [];
  for (const photo of (place.photos ?? []).slice(0, 4)) {
    if (!photo.name) continue;
    const uri = await photoUri(photo.name, apiKey, fetchImpl);
    if (uri) photos.push({ uri });
  }
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  return {
    sourceUrl: place.googleMapsUri ?? sourceUrl,
    name,
    category: place.primaryTypeDisplayName?.text ?? place.types?.[0]?.replaceAll("_", " ") ?? "",
    address: place.formattedAddress ?? "",
    whatsapp: phone.replace(/\D/g, ""),
    reviews: reviewsOf(place),
    phone: phone || null,
    website: place.websiteUri ?? null,
    hours: place.regularOpeningHours?.weekdayDescriptions ?? [],
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    photos,
    location: typeof latitude === "number" && typeof longitude === "number" ? { latitude, longitude } : null,
  };
}

/** La clave no sale de este módulo. Si falta o Google falla, el caller muestra el fixture. */
export async function resolveBusiness(input: string, apiKey: string | undefined, fetchImpl: FetchLike = fetch): Promise<BusinessLookup> {
  const query = input.trim();
  if (!query) return fixture(`Pegá un link o un nombre. ${FIXTURE}`);
  if (!apiKey) return fixture(NO_KEY);

  try {
    let parsed = parseBusinessQuery(query);
    if (parsed.followRedirect) parsed = parseBusinessQuery(await followRedirects(query, fetchImpl));
    if (!parsed.placeId && !parsed.textQuery) return fixture(NOT_FOUND);
    const place = await searchPlace(parsed, apiKey, fetchImpl);
    if (!place?.displayName?.text) return fixture(NOT_FOUND);
    const business = await toProfile(place, query, apiKey, fetchImpl);
    const raw = {
      query: {
        textQuery: parsed.textQuery,
        placeId: parsed.placeId,
        featureId: parsed.featureId,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      },
      place: { ...place, photos: business.photos?.map((photo) => photo.uri) ?? [] },
    };
    return { source: "places", message: null, business, raw };
  } catch (error) {
    console.error("Places:", error instanceof Error ? error.message : "error");
    return fixture(FAILED);
  }
}
