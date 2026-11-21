import { describe, expect, test } from "bun:test";

import { followRedirects, parseBusinessQuery } from "./parse-business-query.ts";

const MAPS =
  "https://www.google.com/maps/place/Panader%C3%ADa+La+Esquina/@-32.8891234,-68.8451234,17z/data=!4m6!3m5!1s0x967e091a1b2c3d4e:0x8f1a2b3c4d5e6f70!8m2!3d-32.8900001!4d-68.8500002";

describe("parseBusinessQuery", () => {
  test("lee nombre, coordenadas y feature id de un link de Maps", () => {
    const parsed = parseBusinessQuery(MAPS);
    expect(parsed.textQuery).toBe("Panadería La Esquina");
    expect(parsed.featureId).toBe("0x967e091a1b2c3d4e:0x8f1a2b3c4d5e6f70");
    expect(parsed.latitude).toBe(-32.8900001);
    expect(parsed.longitude).toBe(-68.8500002);
    expect(parsed.placeId).toBeNull();
    expect(parsed.followRedirect).toBe(false);
  });

  test("prioriza el place id ChIJ cuando viene en el link", () => {
    const parsed = parseBusinessQuery("https://www.google.com/maps/search/?api=1&query=Cafe+Central&query_place_id=ChIJabc_def-123");
    expect(parsed.placeId).toBe("ChIJabc_def-123");
    expect(parsed.textQuery).toBe("Cafe Central");
  });

  test("un link corto se marca para seguir el redirect", () => {
    expect(parseBusinessQuery("https://maps.app.goo.gl/abcDEF").followRedirect).toBe(true);
    expect(parseBusinessQuery("https://g.co/kgs/AbCd").followRedirect).toBe(true);
    expect(parseBusinessQuery("https://goo.gl/maps/xyz").followRedirect).toBe(true);
  });

  test("un nombre suelto es la búsqueda", () => {
    const parsed = parseBusinessQuery("Panadería La Esquina, Godoy Cruz");
    expect(parsed.textQuery).toBe("Panadería La Esquina, Godoy Cruz");
    expect(parsed.followRedirect).toBe(false);
  });

  test("lee q= de una búsqueda de Maps", () => {
    const parsed = parseBusinessQuery("https://www.google.com/maps?q=YPF+Godoy+Cruz");
    expect(parsed.textQuery).toBe("YPF Godoy Cruz");
  });
});

describe("followRedirects", () => {
  test("sigue un maps.app.goo.gl hasta la ficha", async () => {
    const fetchImpl = async (url: string) => {
      if (url.startsWith("https://maps.app.goo.gl/")) {
        return new Response(null, { status: 302, headers: { location: MAPS } });
      }
      return new Response("ok", { status: 200 });
    };
    const finalUrl = await followRedirects("https://maps.app.goo.gl/abc", fetchImpl);
    expect(parseBusinessQuery(finalUrl).textQuery).toBe("Panadería La Esquina");
  });
});
