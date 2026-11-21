---
name: arquitectura
description: Dónde va cada archivo en el monorepo de Vitrina (apps/web, packages/ui, features del kit) y qué imports están prohibidos. Usar antes de crear un archivo, un paquete o una app, de mover código o de agregar una dependencia.
---

# Arquitectura

Vitrina todavía no tiene este árbol. El primero se arma así, con las prácticas del monorepo de referencia y el producto del README. No abrir un `src/` suelto en la raíz.

## Dónde va cada cosa

| Qué es | Dónde |
|---|---|
| La app | `apps/web`. Vite, React 19, TanStack Router. Alias `@/` → `apps/web/src/*` |
| Página de una ruta | `apps/web/src/pages/<nombre>.tsx`. La registra `createRoute` en `apps/web/src/main.tsx` |
| Una zona del producto | `apps/web/src/features/<feature>/{api,components,hooks,utils}/`. Features previstas: `intake`, `brand`, `landing`, `posts`, `ads`, `adjustments`, `credits` |
| UI que conoce el router | `apps/web/src/components/` |
| Lógica sin JSX | Raíz de `apps/web/src/`: `types.ts` y, cuando haga falta, `url-state.ts` |
| Controles y tokens | `packages/ui` (`@vitrina/ui`). Sin router, sin créditos, sin el kit |
| Tipos y fixture del kit | `packages/kit` (`@vitrina/kit`). **Propuesta:** si el fixture es chico, puede vivir en `apps/web` hasta que otra app lo use |

No crear `apps/panel`, `apps/votacion`, `packages/scrapers` ni `data/raw`. Eso es de Mendoza Transparente y este producto no lo usa.

Si dos apps necesitan lo mismo, va a un paquete. Un paquete no importa una app.

## Imports

- Dentro de `apps/web/src`, lo que no está en el mismo directorio se importa con `@/` y la extensión.
- Sin barrels: no crear un `index.ts` que solo reexporta.
- Archivos en `kebab-case`. TypeScript estricto, `noUncheckedIndexedAccess`. En la web y en la UI, `noUnusedLocals`.
- Scope `@vitrina/*`. No publicar paquetes como `@mt/*`.

## Dirección

Al scaffoldear, copiar las reglas que siguen aplicando y correrlas con `bun run lint:arch`:

- sin ciclos;
- un paquete no importa una app;
- `packages/ui` no importa el router ni `@vitrina/kit`;
- una página no importa otra página;
- `components/` no importa `pages/`;
- un `*.ts` de la raíz de `src/` no importa componentes ni páginas.

Si una regla molesta, el archivo está en la carpeta equivocada. Una excepción de Biome lleva motivo: `// biome-ignore <regla>: <motivo>`.

## Dependencias

- Bun 1.4.2, workspaces `apps/*` y `packages/*`, Turborepo. No mezclar npm ni pnpm.
- La dependencia se agrega en el paquete que la usa y se commitea `bun.lock`.
- Controles: React Aria y BoardUI, dentro de `packages/ui`. No sumar Radix ni `cva`.
- La demo no suma SDKs de Google, de IA ni de Mercado Pago. Esos entran con el ítem del roadmap, y el PR dice qué costo tienen.
- Gráficos de series (Recharts) no son parte del kit. No agregarlos por copiar el referente.

## Checklist

1. ¿Es un control genérico? → `packages/ui`. ¿Es de una feature? → `features/<feature>/`. ¿No tiene JSX? → `types.ts` o `packages/kit`.
2. Nombre de archivo en `kebab-case`, identificadores en inglés, comentario en español.
3. Imports con `@/` y sin ciclos.
