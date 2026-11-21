---
name: capa-de-datos
description: Tipos del kit de marketing de Vitrina (ficha, branding, landing, posteos, anuncios, créditos) y cómo se cargan en la demo con un fixture. Usar al agregar un tipo, un fixture o la carga de datos de una página. No usar para scrapers ni CSV de datos públicos.
---

# Capa de datos

Vitrina no archiva datos públicos. No hay `sources.yaml`, `data/raw`, `data/processed` ni recolectores. El dato es el kit de un comercio.

La demo es 100 % ficticia y no llama APIs. El fixture vive en el repo y la pantalla lo lee. Google Places, la IA y Mercado Pago están en el roadmap: no se anticipan en el código.

## Tipos

Ponerlos en un solo lugar (`packages/kit` si el paquete existe, si no `apps/web/src/types.ts`) y usarlos en el fixture y en la página. No duplicar la forma en el componente.

| Tipo | Qué guarda |
|---|---|
| `BusinessProfile` | `sourceUrl`, `name`, `category`, `address`, `whatsapp`, `reviews` (`text`, `author`) |
| `BrandKit` | `palette`, `fonts`, `voice`, `logo` |
| `LandingPage` | Secciones, CTA de WhatsApp, testimonios sacados de `reviews` |
| `InstagramPost` | Exactamente 9. Cada uno tiene texto y una pieza visual |
| `AdIdea` | Exactamente 5. `channel` es `instagram`, `facebook` o `google-ads`. Trae `objective`, `audience`, `copy`, `cta` y la pieza |
| `MarketingKit` | La ficha más branding, landing, posteos y anuncios |
| `Adjustment` | `instruction` en texto libre, `target` (qué parte del kit) y `cost: 1` |
| `Account` | `credits`, `plan` (`free` o `pro`) |

Reglas que ya están decididas y se prueban con `bun test`:

- El primer kit, sin registro, es gratis y es uno solo.
- Registrarse suma 30 créditos.
- Un kit completo cuesta 10. Un ajuste cuesta 1.
- En la demo, `plan: "pro"` no dispara un cobro.

Los textos que ve el comercio salen de estos objetos. La página no reescribe el precio ni la cantidad.

## Cómo se carga en la demo

Un módulo de fixture exporta un `MarketingKit` (o unos pocos) y `loadKit(id)` lo devuelve. El `loader` de la ruta lo llama. El componente no hace `fetch` a Google ni arma el kit por su cuenta.

Cuando el ajuste es solo de presentación (cuál de los 9 posteos está abierto), va en la query. Ver la skill `pagina-feature-componente`.

## Cuando deje de ser un fixture

Cada ítem del roadmap reemplaza el origen, no el tipo:

| Ítem | Qué cambia |
|---|---|
| Google Places API | `BusinessProfile` se llena desde la ficha real. La clave es `GOOGLE_PLACES_API_KEY`, fuera del repo |
| IA generativa | Branding, textos y piezas salen de un proveedor que todavía no está elegido. La pantalla sigue leyendo un `MarketingKit` |
| Mercado Pago | `Account` registra el plan. El token es `MERCADOPAGO_ACCESS_TOKEN`. Hasta entonces el pago queda simulado |

La cuenta y los créditos hay que persistirlos. **Propuesta:** una base detrás de la app, no un JSON en el cliente. No está elegido el motor.

## Qué no hacer

- Copiar el recorrido crudo → CSV → `build-data.ts` del referente.
- Inventar reseñas, un teléfono o un rubro que el fixture (o, más adelante, la ficha) no trae, y mostrarlos como si fueran del comercio.
- Llamar a una API real desde la demo.
- Guardar una clave en el cliente con prefijo `VITE_`. `VITE_SITE_URL` es la única variable pública prevista, y solo cuando haya dominio.
