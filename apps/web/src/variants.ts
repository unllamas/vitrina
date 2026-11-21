import type { AdChannel, AdIdea, BrandColor, BusinessProfile, MarketingKit } from "./types.ts";

/** Variantes que entiende el texto libre. No hay un modelo atrás. */
export const VARIANT_IDS = ["base", "formal", "calido", "cercano"] as const;
export type VariantId = (typeof VARIANT_IDS)[number];

export function isVariantId(value: string): value is VariantId {
  return (VARIANT_IDS as readonly string[]).includes(value);
}

export function matchVariant(text: string): VariantId | null {
  const folded = text.trim().toLocaleLowerCase("es-AR").normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ");
  if (!folded) return null;
  if (folded.includes("formal")) return "formal";
  if (folded.includes("calid") || folded.includes("warm")) return "calido";
  if (folded.includes("cercan") || folded.includes("amig")) return "cercano";
  if (folded.includes("original") || folded.includes("volver") || folded.includes("reinic")) return "base";
  return null;
}

function rgb(hex: string): [number, number, number] {
  const body = hex.replace("#", "");
  const value = Number.parseInt(body, 16);
  if (!/^[\da-fA-F]{6}$/.test(body) || Number.isNaN(value)) return [0, 0, 0];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixHex(from: string, to: string, amount: number): string {
  const left = rgb(from);
  const right = rgb(to);
  const mixed = left.map((channel, index) => Math.round(channel + ((right[index] ?? channel) - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function placeOf(address: string): string {
  const parts = address.split(",").map((part) => part.trim());
  return parts.length >= 2 ? (parts[parts.length - 2] ?? address) : address;
}

function paletteFor(palette: BrandColor[], variant: VariantId): BrandColor[] {
  const fondo = palette[0];
  const acento = palette[1];
  const tinta = palette[2];
  const apoyo = palette[3];
  if (!fondo || !acento || !tinta || !apoyo || variant === "base") return palette.map((color) => ({ ...color }));
  if (variant === "calido") {
    return [
      { name: "Crema", hex: mixHex(fondo.hex, "#F8E2C8", 0.72) },
      { name: "Ámbar", hex: mixHex(acento.hex, "#C4622D", 0.8) },
      { name: "Café", hex: mixHex(tinta.hex, "#3A2418", 0.45) },
      { name: "Durazno", hex: mixHex(apoyo.hex, "#E7A06A", 0.55) },
    ];
  }
  if (variant === "formal") {
    return [
      { name: "Hueso", hex: mixHex(fondo.hex, "#E6E8EB", 0.7) },
      { name: "Tinta", hex: mixHex(acento.hex, "#1E3A5F", 0.72) },
      { name: "Carbón", hex: mixHex(tinta.hex, "#1A1D23", 0.55) },
      { name: "Gris", hex: mixHex(apoyo.hex, "#8B93A1", 0.6) },
    ];
  }
  return [
    { name: "Nube", hex: mixHex(fondo.hex, "#F4F7FB", 0.55) },
    { name: "Agua", hex: mixHex(acento.hex, "#2F6FED", 0.5) },
    { name: tinta.name, hex: tinta.hex },
    { name: apoyo.name, hex: mixHex(apoyo.hex, "#7BA3D4", 0.45) },
  ];
}

function voiceFor(variant: Exclude<VariantId, "base">): string {
  if (variant === "formal") return "De usted. Frases cortas, sin diminutivos. Informa y no insiste.";
  if (variant === "calido") return "Invita a pasar. Habla del oficio y de la gente, con colores de tierra y sin apuro.";
  return "De vos, como un mensaje. Pregunta, ofrece guardar lo que hay y no da vueltas.";
}

function fontsFor(variant: Exclude<VariantId, "base">): MarketingKit["brand"]["fonts"] {
  if (variant === "formal") {
    return [
      { role: "Títulos", name: "Newsreader" },
      { role: "Texto", name: "Source Sans 3" },
    ];
  }
  if (variant === "calido") {
    return [
      { role: "Títulos", name: "Fraunces" },
      { role: "Texto", name: "Source Sans 3" },
    ];
  }
  return [
    { role: "Títulos", name: "Outfit" },
    { role: "Texto", name: "Source Sans 3" },
  ];
}

type Line = (business: BusinessProfile) => string;

const LINES: Record<Exclude<VariantId, "base">, Line[]> = {
  formal: [
    (b) => `${b.name}. Los esperamos en ${placeOf(b.address)}.`,
    (b) => `Disponibilidad del día en ${b.name}.`,
    () => "Consultas por WhatsApp, con respuesta en el día.",
    (b) => `${b.category} en ${placeOf(b.address)}.`,
    (b) => `${b.name} atiende en el local.`,
    () => "Elaboración propia. Sin intermediarios.",
    (b) => `Visitas en ${placeOf(b.address)}, con horario publicado.`,
    (b) => `Encargos con anticipación en ${b.name}.`,
    (b) => `Agradecemos su visita. ${b.name}.`,
  ],
  calido: [
    (b) => `Te esperamos en ${b.name}.`,
    (b) => `Hoy hay del día en ${b.name}.`,
    () => "Pasá cuando puedas. Te guardamos un lugar.",
    (b) => `En ${placeOf(b.address)}, con tiempo para atenderte.`,
    () => "El local ya está abierto. Vení.",
    () => "Lo hacemos nosotros, de a poco.",
    (b) => `Si andás por ${placeOf(b.address)}, caé.`,
    () => "Si querés encargar, te lo preparamos con gusto.",
    (b) => `Gracias por venir. ${b.name} sigue acá.`,
  ],
  cercano: [
    (b) => `¿Pasás por ${b.name}?`,
    (b) => `Hoy en ${b.name} hay del día.`,
    () => "Te guardamos lo que queda. Escribinos.",
    (b) => `${b.name} está en ${placeOf(b.address)}.`,
    (b) => `Abrimos hoy. ${b.name}.`,
    () => "Hecho por nosotros, sin vueltas.",
    () => "Si andás cerca, caé.",
    () => "¿Querés encargar? Avisanos por WhatsApp.",
    (b) => `Gracias por venir. ${b.name} sigue acá.`,
  ],
};

const AD_LINES: Record<Exclude<VariantId, "base">, Record<AdChannel, { copy: string; cta: string }>> = {
  formal: {
    instagram: { copy: "Elaboración del día, con cupo limitado.", cta: "Consultar" },
    facebook: { copy: "Encargos y consultas, con respuesta en el día.", cta: "Escribir" },
    "google-ads": { copy: "Consulte horario y dirección.", cta: "Cómo llegar" },
  },
  calido: {
    instagram: { copy: "Te esperamos cuando puedas.", cta: "Quiero pasar" },
    facebook: { copy: "Te guardamos un lugar.", cta: "Avisame" },
    "google-ads": { copy: "Pasá cuando quieras.", cta: "Ver el local" },
  },
  cercano: {
    instagram: { copy: "¿Pasás hoy?", cta: "Escribinos" },
    facebook: { copy: "Te decimos qué hay ahora.", cta: "Preguntar" },
    "google-ads": { copy: "Escribinos y vení.", cta: "Cómo llegar" },
  },
};

function styledAd(ad: AdIdea, index: number, business: BusinessProfile, variant: Exclude<VariantId, "base">, accent: BrandColor): AdIdea {
  const line = AD_LINES[variant][ad.channel];
  const copy = index % 2 === 0 ? `${business.name}. ${line.copy}` : `${line.copy} ${business.name}.`;
  return { ...ad, copy, cta: line.cta, visual: `Pieza en ${accent.name} (${accent.hex}).` };
}

/**
 * Aplica una variante sin tocar el kit de origen ni las reseñas.
 * El nombre del comercio se conserva: si vino de Places, sigue siendo ese.
 */
export function presentKit(kit: MarketingKit, variant: VariantId): MarketingKit {
  if (variant === "base") return kit;
  const palette = paletteFor(kit.brand.palette, variant);
  const accent = palette[1];
  if (!accent) return kit;
  const place = placeOf(kit.business.address);
  const lines = LINES[variant];
  return {
    ...kit,
    brand: { ...kit.brand, palette, fonts: fontsFor(variant), voice: voiceFor(variant) },
    landing: {
      ...kit.landing,
      headline:
        variant === "formal"
          ? kit.business.name
          : variant === "calido"
            ? `Te esperamos en ${kit.business.name}`
            : `¿Venís a ${kit.business.name}?`,
      summary:
        variant === "formal"
          ? `${kit.business.category} en ${place}. Atención de usted, sin apuros.`
          : variant === "calido"
            ? `Pasá por el local. En ${place} hay tiempo para atenderte.`
            : `Estamos en ${place}. Escribinos y te decimos qué hay ahora.`,
      whatsappCta: variant === "formal" ? "Consultar por WhatsApp" : variant === "calido" ? "Quiero pasar" : "Escribir por WhatsApp",
    },
    posts: kit.posts.map((post, index) => ({
      ...post,
      caption: lines[index]?.(kit.business) ?? post.caption,
      visual: `Pieza en ${accent.name} (${accent.hex}).`,
    })),
    ads: kit.ads.map((ad, index) => styledAd(ad, index, kit.business, variant, accent)),
  };
}

export function brandSlots(palette: BrandColor[]): { fondo: BrandColor; acento: BrandColor; tinta: BrandColor } {
  const fondo = palette[0];
  const acento = palette[1];
  const tinta = palette[2];
  if (!fondo || !acento || !tinta) throw new Error("La paleta tiene que traer fondo, acento y tinta");
  return { fondo, acento, tinta };
}

export function fontName(kit: MarketingKit, role: "Títulos" | "Texto"): string {
  return kit.brand.fonts.find((font) => font.role === role)?.name ?? (role === "Títulos" ? "Fraunces" : "Source Sans 3");
}
