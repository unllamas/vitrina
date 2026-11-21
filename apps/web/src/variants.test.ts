import { describe, expect, test } from "bun:test";

import { DEMO_KIT_ID, loadKit } from "./fixture.ts";
import { personalizeKit } from "./places/personalize-kit.ts";
import type { BusinessProfile } from "./types.ts";
import { matchVariant, presentKit } from "./variants.ts";

describe("variantes del kit", () => {
  test("el texto libre cae en una variante conocida", () => {
    expect(matchVariant("más formal")).toBe("formal");
    expect(matchVariant("colores más cálidos")).toBe("calido");
    expect(matchVariant("más cercano")).toBe("cercano");
    expect(matchVariant("volver al original")).toBe("base");
    expect(matchVariant("hacelo violeta")).toBeNull();
  });

  test("el ajuste cambia la marca y no inventa reseñas", () => {
    const kit = loadKit(DEMO_KIT_ID);
    if (!kit) throw new Error("falta el kit");
    const business: BusinessProfile = {
      ...kit.business,
      name: "Farmacia del Parque",
      category: "Farmacia",
      reviews: [{ author: "Rosa", text: "Me consiguieron el remedio." }],
    };
    const personalized = personalizeKit(kit, business);
    const warm = presentKit(personalized, "calido");
    expect(warm.business.name).toBe("Farmacia del Parque");
    expect(warm.landing.testimonials).toEqual(business.reviews);
    expect(warm.brand.palette[1]?.hex).not.toBe(personalized.brand.palette[1]?.hex);
    expect(warm.landing.headline).toBe("Te esperamos en Farmacia del Parque");
    expect(warm.posts[0]?.caption).not.toBe(personalized.posts[0]?.caption);
    expect(warm.ads[0]?.copy).not.toBe(personalized.ads[0]?.copy);
    expect(warm.posts).toHaveLength(9);
    expect(warm.ads).toHaveLength(5);
    expect(personalized.brand.voice).toBe(kit.brand.voice);
  });
});
