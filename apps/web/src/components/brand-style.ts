import type { BrandKit } from "@/types.ts";

export function luminance(hex: string): number {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return 0;
  const channels = [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((part) => Number.parseInt(part, 16));
  if (channels.some((channel) => Number.isNaN(channel))) return 0;
  const [red, green, blue] = channels;
  if (red === undefined || green === undefined || blue === undefined) return 0;
  return (red * 299 + green * 587 + blue * 114) / 1000;
}

export function readableInk(background: string): string {
  return luminance(background) > 160 ? "#241c18" : "#f6f1ea";
}

export function brandFont(brand: BrandKit, role: string, fallback: string): string {
  const name = brand.fonts.find((font) => font.role === role)?.name;
  return name ? `"${name}", ${fallback}` : fallback;
}

export function brandColors(brand: BrandKit): string[] {
  const colors = brand.palette.map((color) => color.hex).filter((hex) => hex.trim().length > 0);
  return colors.length > 0 ? colors : ["#f3e6d0", "#c4654a", "#4a3226"];
}

export function colorAt(colors: string[], index: number): string {
  const color = colors[index % colors.length];
  return color ?? "#f3e6d0";
}

/** Papel, acento y tinta a partir de la paleta, sin asumir el orden del fixture. */
export function brandRoles(brand: BrandKit): { paper: string; accent: string; ink: string } {
  const colors = [...brand.palette].sort((a, b) => luminance(b.hex) - luminance(a.hex));
  const paper = colors[0]?.hex ?? "#f3e6d0";
  const ink = colors[colors.length - 1]?.hex ?? "#4a3226";
  const accent = colors[1]?.hex ?? ink;
  return { paper, accent, ink };
}

export function ctaColors(paper: string, ink: string): { background: string; color: string } {
  if (luminance(ink) < 150 && Math.abs(luminance(paper) - luminance(ink)) > 70) {
    return { background: ink, color: luminance(paper) > 150 ? paper : "#f6f1ea" };
  }
  return luminance(paper) > 160 ? { background: "#241c18", color: "#f6f1ea" } : { background: "#f6f1ea", color: "#241c18" };
}
