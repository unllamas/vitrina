import type { BusinessPhoto, BusinessProfile, LandingPage, OpeningHours, Review } from "@/types.ts";

import { photoProxyPath } from "./photo-proxy.ts";

interface PlaceText {
  text?: string;
}

interface PlaceComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface PlacePeriodPoint {
  day?: number;
  hour?: number;
  minute?: number;
}

export interface PlacesPlace {
  id?: string;
  displayName?: PlaceText;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
    periods?: { open?: PlacePeriodPoint; close?: PlacePeriodPoint }[];
  };
  primaryType?: string;
  primaryTypeDisplayName?: PlaceText;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
  reviews?: {
    rating?: number;
    text?: PlaceText;
    originalText?: PlaceText;
    authorAttribution?: { displayName?: string };
  }[];
  photos?: { name?: string }[];
  googleMapsUri?: string;
  addressComponents?: PlaceComponent[];
}

export interface MappedPlace {
  business: BusinessProfile;
  landing: Pick<LandingPage, "whatsappPrefill" | "titleTag" | "metaDescription" | "schemaType">;
}

const GENERIC_TYPES = new Set([
  "point_of_interest",
  "establishment",
  "political",
  "geocode",
  "premise",
  "street_address",
  "plus_code",
  "food",
  "health",
]);

const SCHEMA_BY_TYPE: Record<string, string> = {
  bakery: "Bakery",
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  bar: "BarOrPub",
  meal_takeaway: "FoodEstablishment",
  meal_delivery: "FoodEstablishment",
  store: "Store",
  clothing_store: "ClothingStore",
  grocery_or_supermarket: "GroceryStore",
  supermarket: "GroceryStore",
  hair_care: "HealthAndBeautyBusiness",
  beauty_salon: "HealthAndBeautyBusiness",
  gym: "ExerciseGym",
  pharmacy: "Pharmacy",
  lodging: "LodgingBusiness",
};

function labelOf(type: string): string {
  return type
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function servicesFrom(place: PlacesPlace): string[] {
  const services: string[] = [];
  const display = place.primaryTypeDisplayName?.text?.trim();
  if (display) services.push(display);
  for (const type of place.types ?? []) {
    if (GENERIC_TYPES.has(type) || type === place.primaryType) continue;
    const label = labelOf(type);
    if (!services.includes(label)) services.push(label);
  }
  return services;
}

export function schemaTypeFrom(place: PlacesPlace): string {
  const candidates = [place.primaryType, ...(place.types ?? [])].filter((type): type is string => Boolean(type));
  for (const type of candidates) {
    const schema = SCHEMA_BY_TYPE[type];
    if (schema) return schema;
  }
  return "LocalBusiness";
}

export function localityFrom(place: PlacesPlace): string | null {
  const components = place.addressComponents ?? [];
  for (const kind of ["locality", "postal_town", "sublocality", "administrative_area_level_2"]) {
    const found = components.find((component) => component.types?.includes(kind));
    const text = found?.longText?.trim() || found?.shortText?.trim();
    if (text) return text;
  }
  return null;
}

function hoursFrom(place: PlacesPlace): OpeningHours | undefined {
  const source = place.regularOpeningHours;
  if (!source) return undefined;
  const periods = (source.periods ?? [])
    .filter((period) => period.open?.day !== undefined && period.open.hour !== undefined && period.open.minute !== undefined)
    .map((period) => {
      const open = { day: period.open?.day ?? 0, hour: period.open?.hour ?? 0, minute: period.open?.minute ?? 0 };
      const close = period.close;
      if (close?.day === undefined || close.hour === undefined || close.minute === undefined) return { open };
      return { open, close: { day: close.day, hour: close.hour, minute: close.minute } };
    });
  return { weekdayDescriptions: source.weekdayDescriptions ?? [], periods };
}

function reviewsFrom(place: PlacesPlace): Review[] {
  return (place.reviews ?? [])
    .map((review) => ({
      author: review.authorAttribution?.displayName ?? "Reseña",
      text: review.text?.text ?? review.originalText?.text ?? "",
      rating: typeof review.rating === "number" ? review.rating : undefined,
    }))
    .filter((review) => review.text)
    .slice(0, 5);
}

function photosFrom(place: PlacesPlace): BusinessPhoto[] {
  const photos: BusinessPhoto[] = [];
  for (const photo of (place.photos ?? []).slice(0, 4)) {
    if (!photo.name) continue;
    const path = photoProxyPath(photo.name);
    if (!path) continue;
    photos.push({ uri: path, url: path });
  }
  return photos;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function landingFrom(business: BusinessProfile, schemaType: string): MappedPlace["landing"] {
  const name = business.name;
  const locality = business.locality;
  const category = business.category;
  const titled = locality ? `${name} en ${locality}` : name;
  const withCategory = category ? `${titled} · ${category}` : titled;
  const description = [name, category, locality ? `en ${locality}` : "", business.address].filter(Boolean).join(" ");
  return {
    whatsappPrefill: `Hola, vi ${name} y quiero consultar.`,
    titleTag: clip(withCategory, 60),
    metaDescription: clip(description, 160),
    schemaType,
  };
}

/** Pasa la respuesta de Places al contrato del kit. Las fotos quedan en el proxy, sin la clave. */
export function mapPlace(place: PlacesPlace, sourceUrl: string): MappedPlace {
  const name = place.displayName?.text?.trim() || "Comercio";
  const phone = place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? "";
  const latitude = place.location?.latitude;
  const longitude = place.location?.longitude;
  const geo = typeof latitude === "number" && typeof longitude === "number" ? { latitude, longitude } : null;
  const category = place.primaryTypeDisplayName?.text ?? (place.primaryType ? labelOf(place.primaryType) : "");
  const business: BusinessProfile = {
    sourceUrl: place.googleMapsUri ?? sourceUrl,
    name,
    category,
    address: place.formattedAddress ?? "",
    whatsapp: phone.replace(/\D/g, ""),
    reviews: reviewsFrom(place),
    services: servicesFrom(place),
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    hours: hoursFrom(place),
    photos: photosFrom(place),
    geo,
    location: geo,
    mapsUrl: place.googleMapsUri ?? null,
    phone: phone || null,
    locality: localityFrom(place),
    website: place.websiteUri ?? null,
  };
  return { business, landing: landingFrom(business, schemaTypeFrom(place)) };
}
