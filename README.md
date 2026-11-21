# Vitrina

**Pegá el link de tu negocio en Google y llevate tu marketing listo.**

## Qué es

Vitrina es una app para comercios. A partir del link de Google Business de un local arma el marketing de una:

- **Branding:** paleta, tipografías, tono de voz y logo.
- **Landing publicable:** con WhatsApp y las reseñas usadas como testimonios.
- **9 posteos** para Instagram.
- **5 ideas de anuncios** para Instagram, Facebook y Google Ads. Cada una trae objetivo, público, texto, CTA y una pieza visual.

Todo se puede volver a pedir en texto libre. «Más formal» o «colores más cálidos» alcanzan para ajustar la parte que no cierra, sin rehacer el kit a mano.

## El problema

Los comercios locales de Mendoza, Argentina, no tienen tiempo ni presupuesto para marketing. Una agencia sale cara y hacerlo en casa compite con atender el negocio. El material queda desparejo, o directamente no existe.

## Modelo freemium

| Qué | Cuánto sale |
|---|---|
| Primer kit, sin registro | Gratis (1 kit) |
| Al registrarte | 30 créditos |
| Kit completo | 10 créditos |
| Cada ajuste | 1 crédito |
| Plan Pro | Mensual, pago con Mercado Pago |

En esta demo el pago con Mercado Pago está simulado: no se cobra nada.

## Aviso

**Esta versión es una demo para el pitch de un hackatón.** Los datos son 100 % ficticios. No consume APIs reales.

## Cómo funciona

1. **Pegá el link.** Copiás la URL de la ficha de Google Business de tu comercio y la pegás en Vitrina.
2. **Se arma el kit.** Con esa ficha salen el branding, la landing, los 9 posteos y las 5 ideas de anuncios.
3. **Pedí un ajuste.** Escribís en texto libre lo que querés cambiar («más formal», «colores más cálidos»). Cada ajuste cuesta 1 crédito.
4. **Llevate el marketing.** La landing queda lista para publicar, con WhatsApp y las reseñas como testimonios, y el resto del material listo para usar.

## Módulos

El producto de arriba ya está definido. En la demo cada uno se ve en la app. El corte fino en `features/` queda para cuando una zona crezca: hoy las pantallas viven en `apps/web/src/pages/`.

| Módulo | Qué cubre | Dónde está |
|---|---|---|
| Ingreso | Pegar el link de Google Business | `/` |
| Branding | Paleta, tipografías, tono de voz y logo | `/kit/$kitId` |
| Landing | Página con WhatsApp y reseñas como testimonios | `/kit/$kitId` |
| Posteos | 9 piezas para Instagram | `/kit/$kitId` |
| Anuncios | 5 ideas (Instagram, Facebook y Google Ads) | `/kit/$kitId` |
| Ajustes | Texto libre sobre una parte del kit, a 1 crédito | `/kit/$kitId`. No regenera el kit |
| Cuenta y créditos | El primer kit no se cobra. La demo arranca con 30 créditos | Indicador en el kit. Mercado Pago, simulado |

No entran en este producto el panel interno, la app de votación, los recolectores de datos públicos ni el archivo crudo de Mendoza Transparente.

## Modelo de datos

Los tipos están en `apps/web/src/types.ts` y el kit ficticio en `apps/web/src/fixture.ts`. No hay `packages/kit`: con una sola app, el paquete sobraba. Los nombres de código van en inglés; lo que lee el comercio, en español.

| Tipo | Campos |
|---|---|
| `BusinessProfile` | Link pegado, nombre, rubro, dirección, WhatsApp, reseñas (texto y autor) |
| `BrandKit` | Paleta, tipografías, tono de voz, logo |
| `LandingPage` | Secciones, CTA de WhatsApp, testimonios armados con las reseñas |
| `InstagramPost` | 9 ítems: texto y pieza visual |
| `AdIdea` | 5 ítems: canal (`instagram`, `facebook`, `google-ads`), objetivo, público, texto, CTA, pieza visual |
| `Adjustment` | Texto libre, qué parte del kit toca, costo de 1 crédito |
| `Account` | Créditos, plan (`free` o `pro`). En la demo el cobro no se ejecuta |

En la demo estos objetos salen de un fixture local. No se descarga la ficha de Google ni se llama a un modelo. Cuando el roadmap lo pida, el mismo tipo se llena con Google Places, con IA y con Mercado Pago, sin cambiarle la forma a la pantalla.

La landing que el comercio publica es la única pieza que tiene sentido servir como página estática. La cuenta y los créditos hay que guardarlos en algún lado: **propuesta**, una base chica detrás de la app (en el proyecto de referencia eso es Cloudflare D1). No está elegido.

## Stack y cómo correrlo

Monorepo en TypeScript estricto, workspaces de Bun y Turborepo. La interfaz es Vite + React 19 + TanStack Router, con las rutas escritas en `apps/web/src/main.tsx`. No es Next.js y no hay backend. El link pegado viaja en la query (`?link=`). El kit sale de un fixture.

| Pieza | Versión | Para qué |
|---|---|---|
| [Bun](https://bun.sh) | `1.4.2` | Instalar, correr TypeScript y `bun test` |
| TypeScript | `^5`, `strict`, `noUncheckedIndexedAccess` | Tipos. También `noUnusedLocals` |
| Turborepo | `^2` | `dev`, `build` y `typecheck` |
| React | `^19.3.0` | UI |
| Vite | `^8.3` | Dev server y build |
| TanStack Router | `^1.170` | Rutas en código |
| Tailwind CSS | `^4.3` | Única forma de estilar |
| Biome | `2.5.15` | Formato y lint: 2 espacios, comillas dobles, punto y coma, ancho 140 |

`packages/ui` tiene `Button`, `Input` y `Card` con tokens neutros (zinc), no la paleta celeste de Mendoza Transparente. React Aria y BoardUI no están en este primer corte. Tampoco dependency-cruiser ni los hooks de git: se suman cuando hagan falta.

Hace falta Bun 1.4.2. Desde la raíz:

```bash
bun install
bun run dev          # la app en http://localhost:5173
bun run build
bun run typecheck
bun run lint
bun test
```

Los paquetes usan el scope `@vitrina/*` (`@vitrina/web`, `@vitrina/ui`).

### Estructura

```
apps/web/                         @vitrina/web
  src/main.tsx                    rutas: / y /kit/$kitId
  src/pages/                      home, kit, not-found
  src/components/layout.tsx       encabezado y outlet
  src/types.ts                    contrato del kit
  src/fixture.ts                  panadería ficticia «La Esquina»
  src/credits.ts                  costos: kit 10, ajuste 1, registro 30
packages/ui/                      @vitrina/ui
  src/components/                 button, input, card
  src/styles/app.css              tokens neutros
```

Imports dentro de `apps/web/src` con alias `@/` y sin archivos `index.ts` que solo reexportan. Nombres de archivo en `kebab-case`. Identificadores en inglés, comentarios y textos de la interfaz en español.

### Variables de entorno

La demo no usa ninguna y no hay `.env.example`. Cuando dejen de ser ficticias, solo entran los nombres, nunca el valor:

| Nombre | Cuándo |
|---|---|
| `VITE_SITE_URL` | Haya un dominio para la landing |
| `GOOGLE_PLACES_API_KEY` | La ficha deje de ser un fixture |
| Clave del proveedor de IA | Haya textos e imágenes generados. El proveedor no está elegido |
| `MERCADOPAGO_ACCESS_TOKEN` | El Plan Pro deje de estar simulado |

No aplican acá las variables del referente que empiezan con `MT_`, ni las de archive.org, del proxy argentino ni de los scrapers.

### Publicar (propuesta)

El referente publica la web en Cloudflare Pages (raíz de la app, salida `dist`, producción en `main`, vista previa solo de `dev`). Es una base razonable para Vitrina y no está decidida. El dominio propio de cada landing está en el roadmap, no en la demo.

## Primeros pasos

El esqueleto ya está en `main` y la rama `dev` apunta al mismo commit. Lo que sigue es producto, no andamiaje:

1. El código nuevo sale de `dev` y vuelve con un PR. `main` queda para publicar.
2. Definir la marca de la chrome. La paleta del comercio vive dentro del kit y no pinta la app.
3. Recién después, los ítems del roadmap. Hasta entonces la demo no llama a ninguna API.

## Roadmap

- Google Places API real, en lugar de la ficha ficticia.
- IA generativa para textos e imágenes.
- Mercado Pago real, en lugar del pago simulado.
- Publicación directa en Instagram.
- Dominio propio para la landing.

## Cómo se contribuye

`dev` existe y parte del mismo punto que `main`. El trabajo nuevo sale de ahí:

```bash
git switch dev && git pull
git switch -c feat/pegar-link
git push -u origin HEAD
```

El PR apunta a `dev`. Título en Conventional Commits: `feat(web): pantalla para pegar el link`. Tipo y ámbito en inglés, descripción en español. Ámbitos previstos: `web`, `ui`, `kit`, `docs`, `ci`, `skills`. Un cambio que cruza todo el repo puede omitir el ámbito.

No se commitean `.env` ni secretos. El detalle está en [`AGENTS.md`](AGENTS.md) y en [`.cursor/skills/`](.cursor/skills/).

## Equipo

Placeholder. Los nombres del equipo van acá cuando estén definidos.
