import { describe, expect, test } from "bun:test";

import { resolveBusiness } from "./resolve-business.ts";

describe("resolveBusiness", () => {
  test("sin clave no llama a la red y cae al fixture", async () => {
    let called = false;
    const result = await resolveBusiness("Café Central", undefined, async () => {
      called = true;
      return new Response("no");
    });
    expect(called).toBe(false);
    expect(result.source).toBe("fixture");
    expect(result.business).toBeNull();
    expect(result.message).toContain("GOOGLE_PLACES_API_KEY");
  });

  test("mapea el primer resultado de Text Search", async () => {
    const fetchImpl = async (url: string) => {
      if (url.includes(":searchText")) {
        return Response.json({
          places: [
            {
              id: "ChIJtest",
              displayName: { text: "Café Central" },
              formattedAddress: "Av. San Martín 100, Mendoza",
              primaryTypeDisplayName: { text: "Cafetería" },
              internationalPhoneNumber: "+54 261 555-0000",
              rating: 4.6,
              userRatingCount: 12,
              reviews: [{ authorAttribution: { displayName: "Ana" }, text: { text: "Buen café." }, rating: 5 }],
            },
          ],
        });
      }
      return new Response("no", { status: 404 });
    };
    const result = await resolveBusiness("Café Central", "test-key", fetchImpl);
    expect(result.source).toBe("places");
    expect(result.business?.name).toBe("Café Central");
    expect(result.business?.category).toBe("Cafetería");
    expect(result.business?.address).toBe("Av. San Martín 100, Mendoza");
    expect(result.business?.whatsapp).toBe("542615550000");
    expect(result.business?.reviews[0]?.author).toBe("Ana");
    expect(JSON.stringify(result.raw)).not.toContain("test-key");
  });
});
