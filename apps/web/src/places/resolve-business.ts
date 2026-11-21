import type { BusinessProfile, LandingPage } from "@/types.ts";

import { mapPlace, type PlacesPlace } from "./map-place.ts";
import { followRedirects, type ParsedBusinessQuery, parseBusinessQuery } from "./parse-business-query.ts";

export interface BusinessLookup {
  source: "places" | "fixture";
  message: string | null;
  business: BusinessProfile | null;
  landing: Pick<LandingPage, "whatsappPrefill" | "titleTag" | "metaDescription" | "schemaType"> | null;
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
  "primaryType",
  "primaryTypeDisplayName",
  "types",
  "addressComponents",
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

function fixture(message: string): BusinessLookup {
  return { source: "fixture", message, business: null, landing: null, raw: null };
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

async function readPlace(response: Response): Promise<PlacesPlace | null> {
  if (!response.ok) return null;
  const body = (await response.json()) as { places?: PlacesPlace[] } & PlacesPlace;
  if (Array.isArray(body.places)) return body.places[0] ?? null;
  if (body.id || body.displayName) return body;
  return null;
}

async function searchPlace(parsed: ParsedBusinessQuery, apiKey: string, fetchImpl: FetchLike): Promise<PlacesPlace | null> {
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

async function loadDetails(placeId: string, apiKey: string, fetchImpl: FetchLike): Promise<PlacesPlace | null> {
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
    const mapped = mapPlace(place, query);
    const raw = {
      query: {
        textQuery: parsed.textQuery,
        placeId: parsed.placeId,
        featureId: parsed.featureId,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      },
      place: { ...place, photos: mapped.business.photos?.map((photo) => photo.uri) ?? [] },
    };
    return { source: "places", message: null, business: mapped.business, landing: mapped.landing, raw };
  } catch (error) {
    console.error("Places:", error instanceof Error ? error.message : "error");
    return fixture(FAILED);
  }
}
