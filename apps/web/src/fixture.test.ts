import { describe, expect, test } from "bun:test";

import { DEMO_KIT_ID, loadKit } from "./fixture.ts";

describe("kit de demostración", () => {
  test("trae 9 posteos y 5 anuncios", () => {
    const kit = loadKit(DEMO_KIT_ID);
    expect(kit?.posts.length).toBe(9);
    expect(kit?.ads.length).toBe(5);
  });

  test("un id desconocido no devuelve kit", () => {
    expect(loadKit("no-existe")).toBeNull();
  });
});
