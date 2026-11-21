import type { MarketingKit } from "./types.ts";

/** Panadería inventada para la demo. Ningún dato sale de Google ni de un modelo. */
export const DEMO_KIT_ID = "la-esquina";

const laEsquina: MarketingKit = {
  id: DEMO_KIT_ID,
  business: {
    sourceUrl: "https://maps.app.goo.gl/ejemplo-la-esquina",
    name: "Panadería La Esquina",
    category: "Panadería",
    address: "San Martín 1200, Godoy Cruz, Mendoza",
    whatsapp: "5492610000000",
    reviews: [
      { author: "Marina L.", text: "El pan del sábado se termina antes de las once. Vale la pena ir temprano." },
      { author: "Hugo P.", text: "Las facturas salen calientes y el café es honesto. Atienden sin apuro." },
    ],
  },
  brand: {
    palette: [
      { name: "Crema", hex: "#F3E6D0" },
      { name: "Terracota", hex: "#C4654A" },
      { name: "Café", hex: "#4A3226" },
      { name: "Oliva", hex: "#6E7A4B" },
    ],
    fonts: [
      { role: "Títulos", name: "Fraunces" },
      { role: "Texto", name: "Source Sans 3" },
    ],
    voice: "Cercana y concreta. Habla de lo que sale del horno hoy, sin promesas grandes ni signos de exclamación.",
    logo: { initials: "LE", label: "La Esquina" },
  },
  landing: {
    headline: "Pan del día en Godoy Cruz",
    summary: "Horneamos de madrugada. El mostrador abre a las 7 y lo que se ve es lo que hay.",
    whatsappCta: "Pedir por WhatsApp",
    testimonials: [
      { author: "Marina L.", text: "El pan del sábado se termina antes de las once. Vale la pena ir temprano." },
      { author: "Hugo P.", text: "Las facturas salen calientes y el café es honesto. Atienden sin apuro." },
    ],
  },
  posts: [
    {
      id: "horno",
      caption: "Salió el pan. Hoy hay flautitas y molde de campo.",
      visual: "Mostrador con panes todavía tibios, luz de mañana.",
    },
    {
      id: "facturas",
      caption: "Facturas hasta que se acaben. Medialunas, vigilantes y cañoncitos.",
      visual: "Bandeja de facturas, fondo crema.",
    },
    { id: "cafe", caption: "Café chico y dos medialunas. El desayuno de la esquina.", visual: "Taza y plato sobre la mesa de la vereda." },
    {
      id: "whatsapp",
      caption: "Si pasás después de las 11, escribinos: te decimos qué queda.",
      visual: "Teléfono con el chat de WhatsApp, sin capturas de datos reales.",
    },
    {
      id: "madrugada",
      caption: "El horno arranca a las 4. Por eso a las 8 el pan ya está.",
      visual: "Horno visto desde la puerta, sin personas reconocibles.",
    },
    { id: "masa", caption: "Masa madre de la casa. Fermenta de un día para el otro.", visual: "Masa en bowl, manos fuera de cuadro." },
    { id: "vereda", caption: "Dos mesas afuera cuando el viento afloja.", visual: "Vereda de Godoy Cruz, mesas vacías, tarde." },
    {
      id: "finde",
      caption: "Encargos para el domingo: tortas chicas y chipá. Pedilos el sábado.",
      visual: "Torta simple sobre crema, sin decoración de más.",
    },
    {
      id: "gracias",
      caption: "Gracias por las reseñas. Seguimos abriendo a las 7.",
      visual: "Fachada de la panadería al abrir, sin marcas de terceros.",
    },
  ],
  ads: [
    {
      id: "ig-whatsapp",
      channel: "instagram",
      objective: "Mensajes por WhatsApp",
      audience: "Gente de Godoy Cruz que desayuna cerca del trabajo",
      copy: "Pan del día en La Esquina. Escribinos y te decimos qué queda.",
      cta: "Enviar mensaje",
      visual: "Pan recién salido, paleta crema y terracota.",
    },
    {
      id: "ig-alcance",
      channel: "instagram",
      objective: "Que más vecinos conozcan el local",
      audience: "Personas que miran cafés y panaderías en Mendoza",
      copy: "Abrimos a las 7 en San Martín 1200. Facturas hasta que se acaben.",
      cta: "Cómo llegar",
      visual: "Fachada y una bandeja, sin texto encima de la foto.",
    },
    {
      id: "fb-familias",
      channel: "facebook",
      objective: "Mensajes de encargos familiares",
      audience: "Familias del barrio que arman el desayuno del domingo",
      copy: "Encargos para el domingo: tortas chicas y chipá. Pedilos el sábado.",
      cta: "Hacer un encargo",
      visual: "Mesa familiar, torta simple al centro.",
    },
    {
      id: "fb-visitas",
      channel: "facebook",
      objective: "Visitas al local entre semana",
      audience: "Oficinas a pocas cuadras de San Martín",
      copy: "Café y medialunas a una cuadra. Estamos desde las 7.",
      cta: "Ver el local",
      visual: "Taza y medialunas en la vereda.",
    },
    {
      id: "google-busqueda",
      channel: "google-ads",
      objective: "Aparecer cuando buscan una panadería cerca",
      audience: "Búsquedas de panadería en Godoy Cruz",
      copy: "Panadería La Esquina. Pan del día, Godoy Cruz. Abierta desde las 7.",
      cta: "Cómo llegar",
      visual: "Anuncio de texto. La pieza es el nombre, la dirección y el horario.",
    },
  ],
};

const kits = new Map<string, MarketingKit>([[laEsquina.id, laEsquina]]);

export function loadKit(id: string): MarketingKit | null {
  const kit = kits.get(id);
  if (!kit) return null;
  if (kit.posts.length !== 9 || kit.ads.length !== 5) {
    throw new Error("El kit de demostración tiene que traer 9 posteos y 5 anuncios");
  }
  return kit;
}
