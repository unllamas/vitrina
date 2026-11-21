import { handleBusinessRequest } from "../../src/places/handle-business-request.ts";

interface PlacesEnv {
  GOOGLE_PLACES_API_KEY?: string;
}

/** Cloudflare Pages: /api/business. La clave es un secreto del proyecto, no una variable VITE_. */
export async function onRequest(context: { request: Request; env: PlacesEnv }): Promise<Response> {
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }
  return handleBusinessRequest(new URL(context.request.url), context.env.GOOGLE_PLACES_API_KEY);
}
