/** Solo el recurso de una foto de Places. Nada de URLs arbitrarias. */
const PHOTO_NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

export function photoProxyPath(name: string): string | null {
  if (!PHOTO_NAME.test(name)) return null;
  return `/api/business-photo?name=${encodeURIComponent(name)}`;
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** El navegador pide esta ruta. La clave se queda en el header hacia Google. */
export async function proxyPlacePhoto(name: string, apiKey: string | undefined, fetchImpl: FetchLike = fetch): Promise<Response> {
  if (!PHOTO_NAME.test(name) || !apiKey) return new Response(null, { status: 404 });
  const upstream = await fetchImpl(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=800`, {
    headers: { "X-Goog-Api-Key": apiKey },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/")) return new Response(null, { status: 502 });
  return new Response(upstream.body, {
    status: 200,
    headers: { "content-type": type, "cache-control": "public, max-age=86400" },
  });
}
