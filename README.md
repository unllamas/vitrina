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

El producto de arriba ya está definido. El corte en carpetas es **propuesta**, para poder empezar a codear sin mezclar todo en un solo archivo.

| Módulo | Qué cubre | Estado |
|---|---|---|
| Ingreso | Pegar el link de Google Business | Definido. En la demo la ficha es ficticia |
| Branding | Paleta, tipografías, tono de voz y logo | Definido |
| Landing | Página publicable, WhatsApp y reseñas como testimonios | Definido |
| Posteos | 9 piezas para Instagram | Definido |
| Anuncios | 5 ideas (Instagram, Facebook y Google Ads): objetivo, público, texto, CTA y pieza visual | Definido |
| Ajustes | Texto libre sobre una parte del kit, a 1 crédito | Definido |
| Cuenta y créditos | Kit gratis sin registro, 30 créditos al registrarse, kit a 10, Plan Pro | Definido. Mercado Pago, simulado |

No entran en este producto el panel interno, la app de votación, los recolectores de datos públicos ni el archivo crudo de Mendoza Transparente. Esas piezas son de otro proyecto.

## Modelo de datos (propuesta)

Todavía no hay tipos en el repo. Esta forma alcanza para la demo y para no inventar columnas de un CSV cívico. Los nombres de código van en inglés; lo que lee el comercio, en español.

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

El código de la demo se sube en breve. Cuando esté, esta sección va a decir con qué está hecha y cómo correrla.

Hasta ese momento no hay `package.json` y los comandos de abajo no corren en este repo. Si el código que se suba usa otra herramienta, se corrige esta base.

La base para empezar a construirla sale de las prácticas de [mendoza-transparente](https://github.com/unllamas/mendoza-transparente), no de su dominio. Monorepo en TypeScript estricto, workspaces de Bun y Turborepo. La interfaz es una app (Vite + React) y el estado que se comparte (qué posteo está abierto, qué anuncio) vive en la URL, no en un store global.

| Pieza | Versión en el referente | Para qué en Vitrina |
|---|---|---|
| [Bun](https://bun.sh) | `1.4.2` | Instalar, correr TypeScript y `bun test` |
| TypeScript | `^5` en la raíz, `strict` y `noUncheckedIndexedAccess` | Tipos. En la web y en la UI, `noUnusedLocals` |
| Turborepo | `^2` | `dev`, `build` y `typecheck` |
| React | `^19.3.0` | UI |
| Vite | `^8.3.4` | Dev server y build |
| TanStack Router | `^1.170.42` | Rutas en código, en `apps/web/src/main.tsx` |
| Tailwind CSS | `^4.3.3` | Única forma de estilar |
| React Aria y BoardUI | `react-aria-components` `^1.17.0` | Controles accesibles, dentro de `packages/ui` |
| Biome | `2.5.15` | Formato y lint: 2 espacios, comillas dobles, punto y coma, ancho 140 |
| dependency-cruiser | `^18` | Que los paquetes no importen la app |
| lefthook y commitlint | `^2.2` y `^21` | Hooks y Conventional Commits |

Hace falta Bun 1.4.2 y Git. Cuando el monorepo exista, desde la raíz:

```bash
bun install
bun run hooks     # una vez por clon
bun run dev       # la app
bun run typecheck
bun run lint
bun test
```

Los paquetes van con scope `@vitrina/*` (`@vitrina/ui`, y los que se creen). No reutilizar `@mt/*`.

### Estructura prevista (propuesta)

```
apps/web/                         la app
  src/pages/                      una página por ruta
  src/features/<feature>/         intake, brand, landing, posts, ads, adjustments, credits
  src/components/                 UI que conoce el router
  src/types.ts                    los tipos de la tabla de arriba
packages/ui/                      @vitrina/ui, sin router ni créditos
packages/kit/                     @vitrina/kit, tipos y fixture del kit (propuesta)
```

Imports dentro de `apps/web/src` con alias `@/` y sin archivos `index.ts` que solo reexportan. Nombres de archivo en `kebab-case`. Identificadores en inglés, comentarios y textos de la interfaz en español.

### Variables de entorno

La demo no usa ninguna: no hay APIs reales. Cuando dejen de ser ficticias, solo entran los nombres, nunca el valor:

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

Orden para dejar de tener solo documentación:

1. Crear la rama `dev` desde `main`. El código nuevo sale de `dev` y vuelve con un PR. `main` queda para publicar.
2. Armar el monorepo (`package.json` con `"packageManager": "bun@1.4.2"`, workspaces `apps/*` y `packages/*`, Turborepo, Biome, TypeScript estricto) y el scope `@vitrina/*`.
3. `apps/web` con la pantalla de pegar el link y un kit ficticio que ya traiga branding, landing, 9 posteos y 5 anuncios.
4. `packages/ui` con los controles base. La paleta celeste de Mendoza Transparente no es la marca de Vitrina: la chrome de la app se define aparte, y cada comercio trae la suya dentro del kit.
5. Recién después, los ítems del roadmap. Hasta entonces la demo no llama a ninguna API.

## Roadmap

- Google Places API real, en lugar de la ficha ficticia.
- IA generativa para textos e imágenes.
- Mercado Pago real, en lugar del pago simulado.
- Publicación directa en Instagram.
- Dominio propio para la landing.

## Cómo se contribuye

Cuando exista `dev`:

```bash
git switch dev && git pull
git switch -c feat/pegar-link
git push -u origin HEAD
```

El PR apunta a `dev`. Título en Conventional Commits: `feat(web): pantalla para pegar el link`. Tipo y ámbito en inglés, descripción en español. Ámbitos previstos: `web`, `ui`, `kit`, `docs`, `ci`, `skills`. Un cambio que cruza todo el repo puede omitir el ámbito.

No se commitean `.env` ni secretos. El detalle está en [`AGENTS.md`](AGENTS.md) y en [`.cursor/skills/`](.cursor/skills/).

## Equipo

Placeholder. Los nombres del equipo van acá cuando estén definidos.
