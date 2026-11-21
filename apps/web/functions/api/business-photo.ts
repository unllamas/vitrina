import { proxyPlacePhoto } from "../../src/places/photo-proxy.ts";

interface PlacesEnv {
  GOOGLE_PLACES_API_KEY?: string;
}

/** La imagen pasa por el server. El query solo trae el nombre del recurso de Places. */
export async function onRequest(context: { request: Request; env: PlacesEnv }): Promise<Response> {
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response(null, { status: 405 });
  }
  const name = new URL(context.request.url).searchParams.get("name") ?? "";
  return proxyPlacePhoto(name, context.env.GOOGLE_PLACES_API_KEY);
}
