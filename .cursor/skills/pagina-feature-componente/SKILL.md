---
name: pagina-feature-componente
description: Cómo se agrega una página, una feature o un componente de Vitrina (pegar el link, kit, landing, posteos, anuncios). Usar al crear o modificar una pantalla, una ruta o un componente.
---

# Página, feature y componente

`apps/web` usa Vite, React 19 y TanStack Router. Las rutas se declaran en `apps/web/src/main.tsx` con `createRootRoute` y `createRoute`. No salen del nombre del archivo.

El árbol todavía no existe. La primera pantalla es la de pegar el link, no una página de datos públicos.

## Una página

1. **Tipo** en `apps/web/src/types.ts` (o en `@vitrina/kit` si el paquete ya existe). Campos en inglés. Ver la skill `capa-de-datos`.
2. **Ruta** en `main.tsx`. Cada página es su propio chunk:

```tsx
const kitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kit/$kitId",
  loader: ({ params }) => loadKit(params.kitId),
  component: page(() => import("./pages/kit.tsx"), "KitPage"),
});
```

`page()` es `lazyRouteComponent`. Una ruta estática se declara antes que una con parámetro, para que gane. El loader de la demo lee el fixture. No llama a una API.

Rutas que el producto pide: `/` para pegar el link, una para ver el kit y una para la landing publicable. Los nombres finos de las rutas son **propuesta** (`/kit/$kitId`, `/l/$slug`).

3. **Página** en `apps/web/src/pages/<nombre>.tsx`. Lee los datos con `getRouteApi(...).useLoaderData()` y no importa otra página. Compone piezas de la feature.
4. **Menú**, si hace falta, en `apps/web/src/components/layout.tsx`.

Imports de UI desde `@vitrina/ui/...` y los de la app con `@/`.

## Estado de la vista

Qué posteo está abierto o qué anuncio se está mirando va en la query, no en `useState`, si alguien se lo puede pasar a otro.

Cuando exista `apps/web/src/url-state.ts`, el patrón del referente es el que vale: `useUrlOption` para un conjunto cerrado, `useUrlText` para un id, `useSetUrlParams` para varias claves. El cambio hace `replace: true` y `resetScroll: false`. El valor por defecto no se escribe.

El `hash` es para bajar a una sección de la landing (`#reseñas`), no para abrir un panel.

## Una feature

| Feature | Qué tiene |
|---|---|
| `intake` | El campo donde se pega el link |
| `brand` | Paleta, tipografías, tono, logo |
| `landing` | La página con WhatsApp y testimonios |
| `posts` | Los 9 posteos |
| `ads` | Las 5 ideas, con canal, objetivo, público, texto, CTA y pieza |
| `adjustments` | El texto libre y a qué parte del kit aplica |
| `credits` | El saldo, el costo de un kit (10) y de un ajuste (1) |

Cada una vive en `apps/web/src/features/<feature>/`, solo con las carpetas que use (`components/`, `api/`, `hooks/`, `utils/`). La página queda corta. Si una pieza no conoce el router y sirve en dos features, pasa a `packages/ui`.

## Un componente

- Buscar primero en `packages/ui`: `Button`, `IconButton` (exige `aria-label`), `Input`, `Textarea`, `Sheet`, `PageHeader`, `Section`.
- No armar un botón o una tarjeta con clases sueltas. Si falta una variante, se agrega al paquete (`buttonClassName`, `tileVariants`, `cardVariants`).
- Un control de BoardUI que no existe se agrega desde `packages/ui` con `BOARDUI_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1 npx -y boardui@latest add <componente>`. No correr `boardui init`. Después, `bunx biome check --write packages/ui` y pasar los textos al español.
- La pieza visual de un posteo o de un anuncio es contenido del kit, no un gráfico de series. No hace falta `apps/web/src/charts/`.

## Al terminar

`bun run typecheck`. Si ya se ve en el navegador, recorrer en 375 px y en 1280 px la pantalla que cambió. La checklist está en la skill `interfaz`.
