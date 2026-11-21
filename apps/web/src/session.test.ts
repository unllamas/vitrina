import { describe, expect, test } from "bun:test";

import { SIGNUP_CREDITS } from "./credits.ts";
import { activateProSession, creditLabel, emptySession, registerSession, tryAdjust } from "./session.ts";

describe("sesión de la demo", () => {
  test("sin cuenta no se puede ajustar", () => {
    expect(creditLabel(emptySession())).toBe("1 kit gratis");
    expect(tryAdjust(emptySession(), "formal").ok).toBe(false);
  });

  test("registrarse suma 30 y el ajuste sale 1, una sola vez", () => {
    const registered = registerSession(emptySession());
    expect(registered.account.credits).toBe(SIGNUP_CREDITS);
    const once = tryAdjust(registered, "calido");
    if (!once.ok) throw new Error("tenía que alcanzar");
    expect(once.charged).toBe(true);
    expect(once.session.account.credits).toBe(SIGNUP_CREDITS - 1);
    const again = tryAdjust(once.session, "calido");
    if (!again.ok) throw new Error("la variante ya paga tenía que pasar");
    expect(again.charged).toBe(false);
    expect(again.session.account.credits).toBe(SIGNUP_CREDITS - 1);
  });

  test("Pro no descuenta", () => {
    const pro = activateProSession(emptySession());
    const adjusted = tryAdjust(pro, "cercano");
    if (!adjusted.ok) throw new Error("Pro tenía que ajustar");
    expect(adjusted.charged).toBe(false);
    expect(adjusted.session.account.credits).toBe(0);
    expect(creditLabel(pro)).toBe("Plan Pro");
  });
});
