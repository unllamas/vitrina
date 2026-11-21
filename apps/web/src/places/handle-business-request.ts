import { resolveBusiness } from "./resolve-business.ts";

/** GET /api/business?q=... La clave entra por argumento, nunca por la query. */
export async function handleBusinessRequest(url: URL, apiKey: string | undefined): Promise<Response> {
  const query = url.searchParams.get("q") ?? "";
  const result = await resolveBusiness(query.slice(0, 4000), apiKey);
  return Response.json(result, { headers: { "cache-control": "no-store" } });
}
