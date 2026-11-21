import { activatePro, applyAdjustment, grantSignupCredits } from "./credits.ts";
import type { Account } from "./types.ts";

/** Cuenta de la demo en este navegador. No reemplaza una base. */
export interface Session {
  account: Account;
  registered: boolean;
  freeKitUsed: boolean;
  paidAdjustments: string[];
}

const STORAGE_KEY = "vitrina:sesion";
export const SESSION_EVENT = "vitrina-sesion";

export function emptySession(): Session {
  return { account: { credits: 0, plan: "free" }, registered: false, freeKitUsed: false, paidAdjustments: [] };
}

export function creditLabel(session: Session): string {
  if (session.account.plan === "pro") return "Plan Pro";
  if (!session.registered && !session.freeKitUsed) return "1 kit gratis";
  if (!session.registered) return "Sin créditos";
  return session.account.credits === 1 ? "1 crédito" : `${session.account.credits} créditos`;
}

export function registerSession(session: Session): Session {
  if (session.registered) return session;
  const granted = grantSignupCredits();
  return { ...session, registered: true, account: { ...granted, plan: session.account.plan } };
}

export function activateProSession(session: Session): Session {
  return { ...session, account: activatePro(session.account) };
}

/** La primera vez de una variante sale 1. Repetirla, el original o Pro no descuentan. */
export function tryAdjust(session: Session, variant: string): { ok: true; session: Session; charged: boolean } | { ok: false } {
  if (variant === "base" || session.account.plan === "pro") return { ok: true, session, charged: false };
  if (session.paidAdjustments.includes(variant)) return { ok: true, session, charged: false };
  let account: Account;
  try {
    account = applyAdjustment(session.account);
  } catch {
    return { ok: false };
  }
  return { ok: true, charged: true, session: { ...session, account, paidAdjustments: [...session.paidAdjustments, variant] } };
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const row = value as Session;
  return (
    typeof row.registered === "boolean" &&
    typeof row.freeKitUsed === "boolean" &&
    Array.isArray(row.paidAdjustments) &&
    !!row.account &&
    typeof row.account.credits === "number" &&
    Number.isFinite(row.account.credits) &&
    (row.account.plan === "free" || row.account.plan === "pro")
  );
}

export function readSession(): Session {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession();
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : emptySession();
  } catch {
    return emptySession();
  }
}

export function writeSession(session: Session): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}
