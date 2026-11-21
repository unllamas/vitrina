import { describe, expect, test } from "bun:test";

import { ADJUSTMENT_COST, activatePro, applyAdjustment, chargeKit, grantSignupCredits, KIT_COST, SIGNUP_CREDITS } from "./credits.ts";

describe("créditos", () => {
  test("registrarse suma 30 créditos", () => {
    expect(grantSignupCredits()).toEqual({ credits: SIGNUP_CREDITS, plan: "free" });
  });

  test("el primer kit no descuenta", () => {
    const account = grantSignupCredits();
    expect(chargeKit(account, true).credits).toBe(30);
  });

  test("un kit completo descuenta 10", () => {
    const account = grantSignupCredits();
    expect(chargeKit(account, false).credits).toBe(30 - KIT_COST);
  });

  test("un ajuste descuenta 1", () => {
    const account = grantSignupCredits();
    expect(applyAdjustment(account).credits).toBe(30 - ADJUSTMENT_COST);
  });

  test("sin créditos el ajuste no se aplica", () => {
    expect(() => applyAdjustment({ credits: 0, plan: "free" })).toThrow();
  });

  test("sin créditos suficientes el kit no se cobra a medias", () => {
    expect(() => chargeKit({ credits: KIT_COST - 1, plan: "free" }, false)).toThrow();
  });

  test("el plan Pro no descuenta", () => {
    const pro = activatePro({ credits: 0, plan: "free" });
    expect(chargeKit(pro, false).credits).toBe(0);
    expect(applyAdjustment(pro).credits).toBe(0);
  });
});
