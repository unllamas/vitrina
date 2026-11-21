/** Lo que se puede leer de un link o de un nombre, sin red. */

export interface ParsedBusinessQuery {
  input: string;
  textQuery: string | null;
  placeId: string | null;
  featureId: string | null;
  latitude: number | null;
  longitude: number | null;
  /** maps.app.goo.gl, goo.gl y g.co: hay que seguir el redirect antes de parsear. */
  followRedirect: boolean;
}

const SHORT_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "g.co"]);

const PLACE_ID = /^(ChIJ[A-Za-z0-9_-]+)$/;
const FEATURE_ID = /0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/;

function empty(input: string): ParsedBusinessQuery {
  return { input, textQuery: null, placeId: null, featureId: null, latitude: null, longitude: null, followRedirect: false };
}

function decodeName(value: string): string {
  try {
    return decodeURIComponent(value).replaceAll("+", " ").replace(/\s+/g, " ").trim();
  } catch {
    return value.replaceAll("+", " ").trim();
  }
}

function numberAt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function placeNameFromPath(pathname: string): string | null {
  const match = pathname.match(/\/maps\/place\/([^/]+)/);
  if (!match?.[1]) return null;
  const name = decodeName(match[1]);
  return name || null;
}

function coordinates(url: URL): { latitude: number | null; longitude: number | null } {
  const at = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const data = url.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const latitude = numberAt(data?.[1] ?? at?.[1]);
  const longitude = numberAt(data?.[2] ?? at?.[2]);
  return { latitude, longitude };
}

function placeIdFrom(url: URL): string | null {
  const fromQuery = url.searchParams.get("query_place_id") ?? url.searchParams.get("place_id");
  if (fromQuery && PLACE_ID.test(fromQuery)) return fromQuery;
  const fromData = url.href.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
  return fromData?.[1] ?? null;
}

function featureIdFrom(url: URL): string | null {
  const match = url.href.match(new RegExp(`!1s(${FEATURE_ID.source})`));
  return match?.[1] ?? null;
}

function textFromQuery(url: URL, pathName: string | null): string | null {
  if (pathName) return pathName;
  const query = url.searchParams.get("query") ?? url.searchParams.get("q");
  if (!query) return null;
  const name = decodeName(query);
  return name || null;
}

/** Acepta un link de Maps, un link corto o un nombre suelto. */
export function parseBusinessQuery(input: string): ParsedBusinessQuery {
  const trimmed = input.trim();
  if (!trimmed) return empty(trimmed);

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ...empty(trimmed), textQuery: trimmed };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return { ...empty(trimmed), textQuery: trimmed };

  const host = url.hostname.replace(/^www\./, "");
  if (SHORT_HOSTS.has(host)) return { ...empty(trimmed), followRedirect: true };

  const pathName = placeNameFromPath(url.pathname);
  const coords = coordinates(url);
  return {
    input: trimmed,
    textQuery: textFromQuery(url, pathName),
    placeId: placeIdFrom(url),
    featureId: featureIdFrom(url),
    latitude: coords.latitude,
    longitude: coords.longitude,
    followRedirect: false,
  };
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Sigue hasta 5 redirects. Si no hay Location, devuelve la última URL. */
export async function followRedirects(start: string, fetchImpl: FetchLike): Promise<string> {
  let current = start;
  for (let hop = 0; hop < 5; hop++) {
    const response = await fetchImpl(current, { method: "GET", redirect: "manual" });
    if (response.status < 300 || response.status >= 400) return current;
    const location = response.headers.get("location");
    if (!location) return current;
    current = new URL(location, current).toString();
  }
  return current;
}
