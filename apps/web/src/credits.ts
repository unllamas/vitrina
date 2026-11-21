import type { Account } from "./types.ts";

/** Números del modelo freemium. El primer kit, sin registro, no se cobra. */
export const SIGNUP_CREDITS = 30;
export const KIT_COST = 10;
export const ADJUSTMENT_COST = 1;

export function grantSignupCredits(): Account {
  return { credits: SIGNUP_CREDITS, plan: "free" };
}

export function canAfford(account: Account, cost: number): boolean {
  return account.credits >= cost;
}

/** El primer kit es gratis. Los siguientes descuentan KIT_COST. El plan Pro no descuenta. */
export function chargeKit(account: Account, kitIsFree: boolean): Account {
  if (kitIsFree || account.plan === "pro") return account;
  if (!canAfford(account, KIT_COST)) throw new Error("No hay créditos para este kit");
  return { ...account, credits: account.credits - KIT_COST };
}

export function applyAdjustment(account: Account): Account {
  if (account.plan === "pro") return account;
  if (!canAfford(account, ADJUSTMENT_COST)) throw new Error("No hay créditos para este ajuste");
  return { ...account, credits: account.credits - ADJUSTMENT_COST };
}

/** El pago simulado de Mercado Pago. No cobra de verdad. */
export function activatePro(account: Account): Account {
  return { ...account, plan: "pro" };
}
