---
name: arquitectura
description: Dónde va cada archivo en el monorepo de Vitrina (apps/web, packages/ui) y qué imports están prohibidos. Usar antes de crear un archivo, un paquete o una app, de mover código o de agregar una dependencia.
---

# Arquitectura

Monorepo Bun 1.4.2, workspaces `apps/*` y `packages/*`, Turborepo. Scope `@vitrina/*`. No es Next.js y no hay backend.

## Dónde va cada cosa

| Qué es | Dónde |
|---|---|
| La app | `apps/web` (`@vitrina/web`). Vite, React 19, TanStack Router |
| Rutas | `apps/web/src/main.tsx`. Hoy: `/` y `/kit/$kitId` |
| Página | `apps/web/src/pages/<nombre>.tsx` |
| UI que conoce el router | `apps/web/src/components/` (`layout.tsx`) |
| Tipos, fixture y créditos | `apps/web/src/types.ts`, `fixture.ts`, `credits.ts` |
| Controles y tokens | `packages/ui` (`@vitrina/ui`). Sin router y sin créditos |

No hay `packages/kit`: con una sola app, los tipos viven al lado de la pantalla. No crear `apps/panel`, `packages/scrapers` ni `data/raw`.

Cuando una zona (branding, posteos, anuncios) deje de entrar en la página, se mueve a `apps/web/src/features/<feature>/`. Hasta entonces no se abre la carpeta vacía.

## Imports

- Dentro de `apps/web/src`, lo que no está en el mismo directorio se importa con `@/` y la extensión: `@/fixture.ts`.
- Los componentes de UI se importan por archivo: `@vitrina/ui/components/button`.
- Sin barrels. Archivos en `kebab-case`. TypeScript estricto, `noUncheckedIndexedAccess`, `noUnusedLocals`.

## Dirección

Un paquete no importa la app. `packages/ui` no importa el router ni `apps/web`. Una página no importa otra página. `components/` no importa `pages/`.

dependency-cruiser todavía no está instalado. Mientras tanto, se respeta la dirección a mano. Si se suma, el comando entra en `bun run lint` en el mismo cambio.

## Dependencias

- Se agregan con Bun en el paquete que las usa y se commitea `bun.lock`.
- No sumar Next.js, Radix ni un store global.
- La demo no suma SDKs de Google, de IA ni de Mercado Pago.
