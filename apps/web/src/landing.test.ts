import { describe, expect, test } from "bun:test";

import { DEMO_KIT_ID, loadKit } from "./fixture.ts";
import { openingState, presentLanding, resolveLocality } from "./landing.ts";
import type { MarketingKit, OpeningHours } from "./types.ts";

function demoKit(): MarketingKit {
  const kit = loadKit(DEMO_KIT_ID);
  if (!kit) throw new Error("falta el kit de demostración");
  return kit;
}

const thursdayNoon = new Date("2026-11-19T15:00:00.000Z");
const thursdayEvening = new Date("2026-11-19T23:30:00.000Z");

const bakeryHours: OpeningHours = {
  weekdayDescriptions: ["jueves: 9:00–20:00"],
  periods: [{ open: { day: 4, hour: 9, minute: 0 }, close: { day: 4, hour: 20, minute: 0 } }],
};

describe("landing del comercio", () => {
  test("con la ficha de hoy deriva la landing y no inventa prueba ni horario", () => {
    const view = presentLanding(demoKit(), thursdayNoon);
    expect(view.headline).toBe("Pan del día en Godoy Cruz");
    expect(view.locality).toBe("Godoy Cruz");
    expect(view.benefitsHeading).toBe("Por qué pedir en Godoy Cruz");
    expect(view.benefits).toHaveLength(3);
    expect(view.benefits[2]).toContain("Panadería en Godoy Cruz");
    expect(view.looseQuote?.text).toContain("El pan del sábado se termina antes de las once.");
    expect(view.reviewBlock).toBeNull();
    expect(view.ratingHook).toBeNull();
    expect(view.openLabel).toBeNull();
    expect(view.todayHours).toBeNull();
    expect(view.photos).toEqual([]);
    expect(view.mapEmbedUrl).toBeNull();
    expect(view.ctaNote).toBe("Escribinos y te confirmamos horarios.");
    expect(view.whatsappUrl).toContain("https://wa.me/5492610000000?text=");
    expect(view.prefill.length).toBeLessThanOrEqual(100);
    expect(view.prefill).toContain("_");
    expect(view.whatsappUrl).toContain(encodeURIComponent(view.prefill));
    expect(view.titleTag).not.toBe(view.headline);
    expect(view.titleTag.length).toBeLessThanOrEqual(60);
    expect(view.metaDescription.length).toBeLessThanOrEqual(155);
    expect(view.schema["@type"]).toBe("Bakery");
    expect(JSON.stringify(view.schema)).not.toContain("aggregateRating");
    expect(JSON.stringify(view.schema)).not.toContain("Review");
    expect(view.schema).not.toHaveProperty("openingHoursSpecification");
  });

  test("Chacras de Coria no se cambia por Luján y la localidad de la ficha gana", () => {
    expect(resolveLocality({ address: "Italia 100, Chacras de Coria, Luján de Cuyo, Mendoza", locality: null })).toBe("Chacras de Coria");
    const view = presentLanding({ ...demoKit(), business: { ...demoKit().business, locality: "Maipú" } });
    expect(view.locality).toBe("Maipú");
  });

  test("el puntaje solo engancha desde 4 y con recuento real", () => {
    const kit = demoKit();
    const low = presentLanding({ ...kit, business: { ...kit.business, rating: 3.9, reviewCount: 40 } });
    expect(low.ratingHook).toBeNull();
    expect(low.metaDescription).not.toContain("3,9");
    const empty = presentLanding({ ...kit, business: { ...kit.business, rating: null, reviewCount: null } });
    expect(empty.ratingHook).toBeNull();
    const high = presentLanding({
      ...kit,
      business: { ...kit.business, rating: 4.8, reviewCount: 12, mapsUrl: "https://maps.example/ficha" },
    });
    expect(high.ratingHook?.label).toBe("★ 4,8 en Google · 12 reseñas");
    expect(high.ratingHook?.href).toBe("https://maps.example/ficha");
  });

  test("con menos de 3 reseñas útiles no hay bloque", () => {
    const kit = demoKit();
    const third = { author: "Lia S.", text: "El café del mediodía está recién hecho.", rating: 5 };
    const low = { author: "Teo R.", text: "No me gustó.", rating: 2 };
    const three = presentLanding({
      ...kit,
      landing: { ...kit.landing, testimonials: [...kit.landing.testimonials.map((review) => ({ ...review, rating: 5 })), third] },
    });
    expect(three.reviewBlock).toHaveLength(3);
    const dropped = presentLanding({
      ...kit,
      landing: { ...kit.landing, testimonials: [low, { author: "Ana", text: "Bien.", rating: 5 }] },
    });
    expect(dropped.reviewBlock).toBeNull();
    expect(dropped.looseQuote?.author).toBe("Ana");
  });

  test("el horario de Places se calcula en Mendoza y entra al schema", () => {
    const kit = demoKit();
    const open = presentLanding({ ...kit, business: { ...kit.business, hours: bakeryHours } }, thursdayNoon);
    expect(open.openLabel).toBe("Abierto ahora, hasta las 20");
    expect(open.todayHours).toBe("Hoy de 9:00 a 20:00");
    expect(open.hoursText).toBe("jueves: 9:00–20:00");
    expect(open.ctaNote).toBe("Te respondemos en el horario de atención.");
    expect(open.schema).toHaveProperty("openingHoursSpecification");
    expect(JSON.stringify(open.schema)).not.toContain("aggregateRating");
    const closed = presentLanding({ ...kit, business: { ...kit.business, hours: bakeryHours } }, thursdayEvening);
    expect(closed.openLabel).toBe("Cerrado ahora");
    expect(openingState({ weekdayDescriptions: [], periods: [] }, thursdayNoon)).toBeNull();
  });

  test("los textos de la landing pisan el derivado y sin WhatsApp no hay wa.me", () => {
    const kit = demoKit();
    const view = presentLanding({
      ...kit,
      business: {
        ...kit.business,
        whatsapp: "",
        phone: "+54 261 555-0101",
        photos: [{ uri: "/api/business-photo?name=a", url: "/api/business-photo?name=a" }],
        geo: { latitude: -32.89, longitude: -68.84 },
      },
      landing: {
        ...kit.landing,
        benefits: ["Horno propio"],
        whatsappPrefill: "Hola, vi Panadería La Esquina y quiero consultar.",
        titleTag: "Panadería en Godoy Cruz | La Esquina",
        metaDescription: "Panadería en Godoy Cruz. Pedí por WhatsApp.",
        schemaType: "Bakery",
      },
    });
    expect(view.whatsappUrl).toBeNull();
    expect(view.phoneUrl).toBe("tel:+542615550101");
    expect(view.contactLabel).toBe("Llamar");
    expect(view.benefits).toEqual(["Horno propio"]);
    expect(view.prefill).toBe("Hola, vi Panadería La Esquina y quiero consultar.");
    expect(view.titleTag).toBe("Panadería en Godoy Cruz | La Esquina");
    expect(view.metaDescription).toBe("Panadería en Godoy Cruz. Pedí por WhatsApp.");
    expect(view.schema["@type"]).toBe("Bakery");
    expect(view.photos[0]?.url).toBe("/api/business-photo?name=a");
    expect(view.mapEmbedUrl).toContain("-32.89");
    expect(view.headline).toBe("Pan del día en Godoy Cruz");
  });

  test("si el titular es solo el nombre, el H1 lleva rubro y barrio", () => {
    const kit = demoKit();
    const view = presentLanding({
      ...kit,
      landing: { ...kit.landing, headline: kit.business.name },
    });
    expect(view.headline).toBe("Panadería en Godoy Cruz");
  });
});
