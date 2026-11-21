/** Contrato del kit. Los textos que ve el comercio salen de acá. */

export interface Review {
  text: string;
  author: string;
  rating?: number;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Horario de Places: textos por día y los períodos crudos. */
export interface OpeningHours {
  weekdayDescriptions: string[];
  periods: { open: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } }[];
}

/** `uri` y `url` apuntan al proxy `/api/business-photo`. No llevan la clave. */
export interface BusinessPhoto {
  uri: string;
  url: string;
}

export interface BusinessProfile {
  sourceUrl: string;
  name: string;
  category: string;
  address: string;
  whatsapp: string;
  reviews: Review[];
  services?: string[];
  rating?: number | null;
  reviewCount?: number | null;
  hours?: OpeningHours;
  photos?: BusinessPhoto[];
  geo?: GeoPoint | null;
  /** Mismo punto que `geo`. Lo deja el mapeo por si otra rama todavía lee `location`. */
  location?: GeoPoint | null;
  mapsUrl?: string | null;
  phone?: string | null;
  locality?: string | null;
  website?: string | null;
}

export interface BrandColor {
  name: string;
  hex: string;
}

export interface BrandKit {
  palette: BrandColor[];
  fonts: { role: string; name: string }[];
  voice: string;
  logo: { initials: string; label: string };
}

export interface LandingPage {
  headline: string;
  summary: string;
  whatsappCta: string;
  testimonials: Review[];
  benefits?: string[];
  whatsappPrefill?: string;
  titleTag?: string;
  metaDescription?: string;
  schemaType?: string;
}

export interface InstagramPost {
  id: string;
  caption: string;
  visual: string;
}

export type AdChannel = "instagram" | "facebook" | "google-ads";

export interface AdIdea {
  id: string;
  channel: AdChannel;
  objective: string;
  audience: string;
  copy: string;
  cta: string;
  visual: string;
}

export interface MarketingKit {
  id: string;
  business: BusinessProfile;
  brand: BrandKit;
  landing: LandingPage;
  posts: InstagramPost[];
  ads: AdIdea[];
}

export type AdjustmentTarget = "brand" | "landing" | "posts" | "ads";

export interface Adjustment {
  instruction: string;
  target: AdjustmentTarget;
  cost: 1;
}

export interface Account {
  credits: number;
  plan: "free" | "pro";
}
