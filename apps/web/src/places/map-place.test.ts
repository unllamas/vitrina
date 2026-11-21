import { describe, expect, test } from "bun:test";

import { DEMO_KIT_ID, loadKit } from "../fixture.ts";
import { mapPlace, type PlacesPlace } from "./map-place.ts";
import { personalizeKit } from "./personalize-kit.ts";

const sample: PlacesPlace = {
  id: "ChIJpanaderia",
  displayName: { text: "Panadería Don Tito" },
  primaryType: "bakery",
  primaryTypeDisplayName: { text: "Panadería" },
  types: ["bakery", "store", "food", "point_of_interest", "establishment"],
  formattedAddress: "San Martín 50, Godoy Cruz, Mendoza",
  addressComponents: [
    { longText: "Godoy Cruz", types: ["locality", "political"] },
    { longText: "Mendoza", types: ["administrative_area_level_1", "political"] },
  ],
  nationalPhoneNumber: "0261 555-0101",
  internationalPhoneNumber: "+54 261 555-0101",
  websiteUri: "https://dontito.example",
  googleMapsUri: "https://maps.google.com/?cid=123",
  rating: 4.4,
  userRatingCount: 86,
  location: { latitude: -32.89, longitude: -68.84 },
  regularOpeningHours: {
    weekdayDescriptions: ["lunes: 7:00–13:00"],
    periods: [{ open: { day: 1, hour: 7, minute: 0 }, close: { day: 1, hour: 13, minute: 0 } }],
  },
  reviews: [{ authorAttribution: { displayName: "Luis" }, text: { text: "Sale caliente." }, rating: 5 }],
  photos: [{ name: "places/ChIJpanaderia/photos/AbCd" }, { name: "https://evil.example/secret" }],
};

describe("mapPlace", () => {
  test("mapea la ficha de Places a los campos opcionales del kit", () => {
    const { business, landing } = mapPlace(sample, "https://maps.example/pegado");

    expect(business.name).toBe("Panadería Don Tito");
    expect(business.category).toBe("Panadería");
    expect(business.rating).toBe(4.4);
    expect(business.reviewCount).toBe(86);
    expect(business.hours?.weekdayDescriptions).toEqual(["lunes: 7:00–13:00"]);
    expect(business.hours?.periods[0]?.open).toEqual({ day: 1, hour: 7, minute: 0 });
    expect(business.hours?.periods[0]?.close).toEqual({ day: 1, hour: 13, minute: 0 });
    expect(business.photos).toEqual([
      {
        uri: "/api/business-photo?name=places%2FChIJpanaderia%2Fphotos%2FAbCd",
        url: "/api/business-photo?name=places%2FChIJpanaderia%2Fphotos%2FAbCd",
      },
    ]);
    expect(business.geo).toEqual({ latitude: -32.89, longitude: -68.84 });
    expect(business.mapsUrl).toBe("https://maps.google.com/?cid=123");
    expect(business.phone).toBe("+54 261 555-0101");
    expect(business.locality).toBe("Godoy Cruz");
    expect(business.services).toEqual(["Panadería", "Store"]);
    expect(business.reviews[0]?.text).toBe("Sale caliente.");
    expect(landing.schemaType).toBe("Bakery");
    expect(landing.whatsappPrefill).toContain("Panadería Don Tito");
    expect(landing.titleTag).toContain("Godoy Cruz");
    expect(landing.metaDescription).toContain("Panadería");
    expect(landing).not.toHaveProperty("benefits");
    expect(JSON.stringify({ business, landing })).not.toContain("AIza");
  });

  test("personalize deja los benefits de la plantilla", () => {
    const base = loadKit(DEMO_KIT_ID);
    if (!base) throw new Error("falta el fixture");
    const template = { ...base, landing: { ...base.landing, benefits: ["Horno propio"] } };
    const { business, landing } = mapPlace(sample, "x");
    const kit = personalizeKit(template, business, landing);
    expect(kit.landing.benefits).toEqual(["Horno propio"]);
    expect(kit.landing.schemaType).toBe("Bakery");
    expect(kit.business.geo?.latitude).toBe(-32.89);
  });

  test("sin tipo conocido el schema es LocalBusiness", () => {
    const { landing } = mapPlace({ displayName: { text: "Kiosco" }, primaryType: "point_of_interest" }, "x");
    expect(landing.schemaType).toBe("LocalBusiness");
  });
});
