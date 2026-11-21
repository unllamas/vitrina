---
name: arquitectura
description: Dónde va cada archivo en el monorepo de Vitrina (apps, packages, pages, features, components) y qué imports están prohibidos. Usar antes de crear un archivo, un paquete o una app, de mover código o de agregar una dependencia.
---

# Arquitectura

Vitrina todavía no tiene este árbol. Cuando se cree el primer archivo de código, se crea así, como en mendoza-transparente. No abrir un `src/` suelto en la raíz ni elegir otro bundler.

## Dónde va cada cosa

| Qué es | Dónde |
|---|---|
| Sitio público | `apps/web` (Vite + React 19 + TanStack Router). Alias `@/` → `apps/web/src/*`, igual que `apps/web/tsconfig.json` del referente |
| Página de una ruta | `apps/web/src/pages/<nombre>.tsx`. Solo arma la pantalla. La registra `createRoute` en `apps/web/src/main.tsx` |
| Código de una sola feature | `apps/web/src/features/<feature>/{api,components,hooks,utils}/`. Solo las carpetas que hagan falta |
| UI de la web que usa router, analítica o datos del sitio | `apps/web/src/components/` |
| Gráficos | `apps/web/src/charts/` |
| Lógica sin JSX | Raíz de `apps/web/src/`: `lib.ts`, `types.ts`, `url-state.ts`, `analytics.ts` |
| Script de build (datos, SEO) | `apps/web/scripts/`. No importa componentes |
| Controles y tokens reutilizables | `packages/ui` (`@mt/ui` en el referente). Sin router, sin PostHog, sin `@mt/core` ni scrapers |
| Descarga, archivo, CSV | `packages/core` (`@mt/core`). Exporta desde `packages/core/src/index.ts` |
| Un recolector por fuente | `packages/scrapers/src/sources/<id>.ts`, función `run(args: string[])` |
| API y base compartidas entre web y panel | `packages/participation`. Las apps no se importan entre sí |

El referente además tiene `apps/panel`, `apps/votacion`, `apps/social`, `packages/assistant` y `packages/mascots`. No crearlos en Vitrina hasta que el producto los pida. Si dos apps necesitan lo mismo, va a un paquete, no a un import cruzado `apps/web` ↔ `apps/panel`.

Al nombrar paquetes nuevos, usar un scope de Vitrina (`@vitrina/ui`, `@vitrina/core`). Las rutas de carpetas se mantienen. En esta guía se citan los nombres `@mt/…` porque así están en el referente.

## Imports

- Dentro de `apps/web/src`, lo que no está en el mismo directorio se importa con `@/` y la extensión: `import { BarList } from "@/charts/bar-list.tsx"`.
- Sin barrels: no crear `index.ts` que solo reexporta.
- Archivos en `kebab-case` (Biome, regla `useFilenamingConvention`).
- TypeScript estricto, `noUncheckedIndexedAccess` (`tsconfig.base.json`). En la web y en la UI, `noUnusedLocals`.

## Dirección de las dependencias

El referente las fija en `.dependency-cruiser.cjs` y las corre con `bun run lint:arch`. Al copiar el monorepo, copiar esas reglas. Prohibido:

- ciclos (`no-circular`);
- un paquete que importa una app (`packages/` → `apps/`);
- `packages/ui` importando `@tanstack/react-router`, `posthog-js`, `packages/core` o `packages/scrapers`;
- una página importando otra página;
- `components/` o `charts/` importando `pages/`;
- un `*.ts` de la raíz de `src/` importando `components/`, `charts/` o `pages/`;
- `apps/web/scripts/` importando componentes;
- el sitio y el panel importándose;
- el código del navegador o de `functions/` importando la base SQLite de desarrollo (`packages/participation/src/local-db.ts`).

Si una regla molesta, el archivo está en la carpeta equivocada. No se apaga la regla. Una excepción de Biome lleva motivo: `// biome-ignore <regla>: <motivo>`.

## Dependencias y costo

- Bun 1.4.2 en la raíz (`packageManager` y `bun.lock`). No mezclar npm ni pnpm.
- Workspaces: `"apps/*"` y `"packages/*"`. Turborepo (`turbo.json`) orquesta `build`, `typecheck` y `dev` (`dev` con `cache: false` y `persistent: true`).
- Agregar una dependencia en el paquete que la usa, con Bun, y commitear `bun.lock`.
- Lo genérico de interfaz ya está en `packages/ui` (React Aria, `tailwind-merge`, Motion, Remix Icon). No sumar Radix, `cva` ni otra librería de componentes.
- HTML, planillas y PDF en los recolectores: el referente ya usa `cheerio`, `xlsx`, `unpdf`, `fflate` y `stream-json` dentro de `@mt/scrapers`. Buscar ahí antes de agregar otra.
- El referente corre en planes gratis (Cloudflare Pages: 500 builds por mes, 20.000 archivos por deploy, 100.000 pedidos a funciones por día; D1: 5 millones de lecturas y 100.000 escrituras por día; PostHog por eventos). Antes de proponer una CI, un workflow, una función o un servicio, decir cuánto gasta y de qué cupo. Lo estático se genera en el build.

## Checklist

1. ¿El archivo es genérico? → `packages/ui`. ¿Es de una feature? → `features/<feature>/`. ¿Lo usan varias features y conoce el sitio? → `components/`. ¿No tiene JSX? → raíz de `src/`.
2. Nombre de archivo en `kebab-case`, identificadores en inglés, comentario de cabecera en español.
3. Imports con `@/` y sin ciclos.
4. Si se agregó un paquete o un archivo de la raíz que una app lee, anotarlo para el *build watch path* de Cloudflare en el mismo cambio.
