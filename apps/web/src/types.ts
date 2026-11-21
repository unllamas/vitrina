/** Contrato del kit. Los textos que ve el comercio salen de acá. */

export interface Review {
  text: string;
  author: string;
  rating?: number;
}

export interface BusinessProfile {
  sourceUrl: string;
  name: string;
  category: string;
  address: string;
  whatsapp: string;
  reviews: Review[];
  phone?: string | null;
  website?: string | null;
  hours?: string[];
  rating?: number | null;
  reviewCount?: number | null;
  photos?: { uri: string }[];
  location?: { latitude: number; longitude: number } | null;
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
