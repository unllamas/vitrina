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
| Ajustes | Texto libre que cae en una variante («más formal», «colores más cálidos», «más cercano»). Cambia la marca y se ve en la landing, los posteos y los anuncios. No toca las reseñas | `/kit/$kitId` |
| Cuenta y créditos | 1 kit gratis sin cuenta. Al registrarse, 30 créditos. Ajuste 1. Plan Pro simulado | Encabezado, `/registro` y `/pro`. Queda en `sessionStorage` (`vitrina:sesion`) |

No entran en este producto el panel interno, la app de votación, los recolectores de datos públicos ni el archivo crudo de Mendoza Transparente.

## Modelo de datos

Los tipos están en `apps/web/src/types.ts` y el kit de plantilla en `apps/web/src/fixture.ts`. No hay `packages/kit`. El nombre, el rubro, la dirección, el teléfono, el sitio, el horario, la puntuación, las reseñas y las fotos salen de Google Places cuando hay clave. La paleta, los 9 posteos y las 5 ideas siguen siendo la plantilla, con el nombre y el rubro reales donde entra en una frase.

| Tipo | Campos |
|---|---|
| `BusinessProfile` | Nombre, rubro, dirección, teléfono, sitio, horario, puntuación, reseñas, fotos y ubicación. `whatsapp` guarda los dígitos del teléfono |
| `BrandKit` | Paleta, tipografías, tono de voz, logo |
| `LandingPage` | Secciones, CTA de WhatsApp, testimonios armados con las reseñas |
| `InstagramPost` | 9 ítems: texto y pieza visual |
| `AdIdea` | 5 ítems: canal (`instagram`, `facebook`, `google-ads`), objetivo, público, texto, CTA, pieza visual |
| `Adjustment` | Texto libre, qué parte del kit toca, costo de 1 crédito |
| `Account` | Créditos, plan (`free` o `pro`). En la demo el cobro no se ejecuta |

El navegador pide `GET /api/business?q=...` con el link o el nombre. No manda la clave. El server (`apps/web/functions/api/business.ts` en Cloudflare Pages, y el mismo handler en el middleware de Vite para `bun run dev`) entiende un link `google.com/maps/place/...` (nombre, coordenadas y el id `!1s0x...:0x...`), un `query_place_id=ChIJ...`, un link corto `maps.app.goo.gl` / `g.co` / `goo.gl` (sigue el redirect) o un nombre suelto. Consulta Places API (New) y, si no hay clave o Google no responde, devuelve el kit de demostración con un mensaje visible. La respuesta cruda se ve en «Datos del comercio» y se puede bajar como JSON.

La landing que el comercio publica es la única pieza que tiene sentido servir como página estática. La cuenta de la demo vive en `sessionStorage` para que el pitch sobreviva un refresh. Una base de verdad (en el referente, Cloudflare D1) sigue sin elegir.

## Stack y cómo correrlo

Monorepo en TypeScript estricto, workspaces de Bun y Turborepo. La interfaz es Vite + React 19 + TanStack Router, con las rutas escritas en `apps/web/src/main.tsx`. No es Next.js. No hay base de datos: la ficha se pide en `GET /api/business` y el resto del kit es una plantilla. El texto pegado viaja en la query (`?link=`).

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

`packages/ui` tiene `Button`, `Input` y `Card` con tokens neutros (zinc), no la paleta celeste de Mendoza Transparente. React Aria, BoardUI y dependency-cruiser no están en este primer corte.

Hace falta Bun 1.4.2. Desde la raíz:

```bash
bun install
bun run hooks        # una vez por clon: Biome antes de commitear y commitlint en el mensaje
bun run dev          # la app en http://localhost:5173
bun run build
bun run typecheck
bun run lint
bun test
```

En cada push a `main` o `dev`, y en cada pull request, GitHub Actions corre lo mismo (`.github/workflows/ci.yml`, job `verificar`): instalar con el lockfile, lint, tipos, pruebas y build.

Los paquetes usan el scope `@vitrina/*` (`@vitrina/web`, `@vitrina/ui`).

### Estructura

```
apps/web/                         @vitrina/web
  src/main.tsx                    rutas: /, /kit/$kitId, /registro, /pro
  src/pages/                      home, kit, registro, pro, not-found
  src/features/kit/components/    landing, grilla de 9 posteos, piezas de anuncios
  src/components/layout.tsx       encabezado, créditos y outlet
  src/types.ts                    contrato del kit
  src/fixture.ts                  panadería ficticia «La Esquina»
  src/variants.ts                 ajustes simulados, sin modelo
  src/credits.ts                  costos: kit 10, ajuste 1, registro 30
  src/session.ts                  kit gratis, cuenta y plan Pro en este navegador
packages/ui/                      @vitrina/ui
  src/components/                 button, input, card
  src/styles/app.css              tokens neutros
```

Imports dentro de `apps/web/src` con alias `@/` y sin archivos `index.ts` que solo reexportan. Nombres de archivo en `kebab-case`. Identificadores en inglés, comentarios y textos de la interfaz en español.

### Variables de entorno

Hoy solo hace falta una, y no va al navegador. El ejemplo está en `.env.example`. Copiarlo a `.env.local` en la raíz (está en `.gitignore`) y reiniciar `bun run dev`:

```bash
GOOGLE_PLACES_API_KEY=la-clave
```

En Google Cloud: habilitar **Places API (New)**, crear una API key y pegarla en esa variable. En Cloudflare Pages, el mismo nombre como secreto o variable del proyecto (raíz `apps/web`), nunca con prefijo `VITE_`. Sin la clave, o si la búsqueda falla, la app sigue y muestra el kit de demostración.

| Nombre | Cuándo |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Ficha real. Solo el server |
| `VITE_SITE_URL` | Haya un dominio para la landing |
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

- Usar los datos crudos de Places para armar el branding y las piezas. La ficha ya se consulta; sin clave sigue el kit de demostración.
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

El PR apunta a `dev` y usa la plantilla de `.github/pull_request_template.md`: qué cambia y por qué, cómo se verificó y riesgos. Lo que no aplica se tacha. El título va en Conventional Commits (`feat(web): pantalla para pegar el link`): tipo y ámbito en inglés, descripción en español. Ámbitos: `web`, `ui`, `kit`, `docs`, `scripts`, `ci`, `skills`, `release`. Un cambio que cruza todo el repo puede omitir el ámbito. commitlint lo controla en el commit, y la CI controla el código.

A `dev` se entra con squash. A `main` se entra con un merge commit desde `dev`, para no reescribir la historia. La CI ya corre sola. La protección que impide pushear directo, forzar o borrar `main` y `dev` no se pudo activar con el token de esta sesión: los pasos exactos están en la skill `git-y-prs`.

No se commitean `.env` ni secretos. El detalle está en [`AGENTS.md`](AGENTS.md) y en [`.cursor/skills/git-y-prs`](.cursor/skills/git-y-prs/SKILL.md).

## Equipo

Placeholder. Los nombres del equipo van acá cuando estén definidos.
