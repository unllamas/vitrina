---
name: pagina-feature-componente
description: Cómo se agrega una página, una feature o un componente en apps/web, con las rutas, loaders y piezas que usa mendoza-transparente. Usar al crear o modificar una pantalla, una ruta, un gráfico o un componente compartido.
---

# Página, feature y componente

El sitio del referente es `apps/web`: Vite, React 19 y TanStack Router. Las rutas no salen de los nombres de archivo. Se declaran en `apps/web/src/main.tsx` con `createRootRoute` / `createRoute` y se cuelgan del root, cuyo componente es `Layout`.

Vitrina todavía no tiene `apps/web`. El primer esqueleto se arma con esta forma, no con otra librería de rutas.

## Una página temática

En el referente, sumar una página que muestra un tema (deuda, empleo, coparticipación) son seis pasos. Seguirlos en orden:

1. **Tipo.** Una interfaz en `apps/web/src/types.ts` (`DeudaTema`, `EmpleoTema`). Campos en inglés, comentarios en español. Los montos del JSON ya vienen calculados: la página no reimplementa la fórmula.
2. **Cálculo.** `apps/web/scripts/temas/<tema>.ts` lee los CSV (vía `@mt/core`) y devuelve ese JSON. `apps/web/scripts/build-data.ts` lo llama y escribe `public/data/temas/<tema>.json`. Ese directorio no se commitea.
3. **Ruta.** En `main.tsx`:

```tsx
const deudaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/deuda",
  loader: () => loadTema<DeudaTema>("deuda"),
  component: page(() => import("./pages/deuda.tsx"), "DeudaPage"),
});
```

`loadTema` está en `apps/web/src/lib.ts` y hace `fetch("/data/temas/<tema>.json")`. Dos pedidos independientes van en `Promise.all`. Una ruta estática (`/funcionarios/historial`) se declara antes que la paramétrica (`/funcionarios/$role`) para que gane.

`page()` usa `lazyRouteComponent`: cada página es su propio chunk. El router se crea con `defaultPreload: "intent"`, `defaultStaleTime: Infinity` (cambiar la query no vuelve a bajar el JSON), `scrollRestoration: true`, `defaultErrorComponent: RouteError` y `defaultNotFoundComponent: RouteNotFound`.

4. **Página.** `apps/web/src/pages/<tema>.tsx` exporta la función de la página. Lee los datos con `getRouteApi("/deuda").useLoaderData()`. Estructura del referente: `PageHeader` (con `action={<ShareButton />}`), una grilla de `StatTile`, secciones `Section` con `id`, gráficos de `@/charts/…`, y al final `FuentesOficiales`. No importa otra página.
5. **Menú.** Entrada en `apps/web/src/components/layout.tsx`, dentro de un grupo que ya exista, con ícono de `@remixicon/react` y una descripción corta.
6. **SEO**, si la página es pública. Entrada en `PAGES` de `apps/web/src/seo.ts` (título hasta 60 caracteres, descripción de 140 a 160) y ficha en `apps/web/scripts/paginas.ts`. `scripts/seo.ts` corre después de `vite build` y corta si un meta sale con `undefined`, `NaN` o `null`. El dominio sale de `VITE_SITE_URL`.

Dentro de la página, imports de UI desde el paquete (`@mt/ui/components/section`, `@mt/ui/components/stat-tile`, `@mt/ui/lib/cx`) y de la app con `@/`.

## Estado de la vista

Pestañas, búsquedas, departamento elegido y hojas abiertas van en la query, no en `useState`.

- `useUrlOption(key, options, fallback)` para un conjunto cerrado (`?ver=personal`).
- `useUrlText(key)` para texto o un id (`?q=`).
- `useSetUrlParams` para cambiar varias claves juntas.

Están en `apps/web/src/url-state.ts`. Cambiar un valor hace `router.navigate({ href, replace: true, resetScroll: false })`: no suma un paso al historial y no mueve el scroll. El valor por defecto no se escribe. Los demás parámetros se conservan.

Links internos a una hoja: `<Link search={{ dato: id }}>`, no un `hash` para abrir un panel. El `hash` es solo para una sección (`#fuentes`). El `id` de `Section` es una o dos palabras en español, estables (`por-anio`), sin años ni cifras.

## Una feature

Si el código solo lo usa una zona del producto, va a `apps/web/src/features/<feature>/`:

| Carpeta | Contenido |
|---|---|
| `api/` | Pedidos al backend (`/api/…`), sin JSX |
| `components/` | Piezas de esa feature |
| `hooks/` | Hooks de esa feature |
| `utils/` | Funciones puras |

Ejemplos reales del referente: `features/participation/api/`, `features/officials/components/`, `features/assistant/`. La página en `pages/` queda corta y compone esas piezas. Si una pieza empieza a servir en dos features y no conoce el router, se muda a `packages/ui`. Si conoce el router o la analítica, se muda a `apps/web/src/components/`.

## Un componente

- Buscar primero en `packages/ui` (`Button`, `IconButton`, `Input`, `Select`, `SegmentedControl`, `Sheet`, `Alert`, `StatTile`, `Section`, `PageHeader`). Se importan por archivo: `@mt/ui/components/base/buttons/button`.
- No armar un botón o una tarjeta con clases sueltas. Si falta una variante, se agrega al paquete (`buttonClassName`, `tileVariants`, `cardVariants`, `listVariants`).
- Un control de BoardUI que no existe se agrega desde `packages/ui` con `BOARDUI_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1 npx -y boardui@latest add <componente>`. No correr `boardui init`. Después, `bunx biome check --write packages/ui` y pasar textos al español.
- Si el componente trae `next/link`, cambiarlo por el `Link` de `react-aria-components`. La web lo conecta con TanStack en `apps/web/src/components/ui-providers.tsx`.
- Lo que mide o navega vive en la app, no en el paquete: `TrackedSheet`, `TrackedSegmented`, `ListSearch`, `Breadcrumbs`.
- Gráficos nuevos: `apps/web/src/charts/`, Recharts, colores solo con tokens (`highlight`, `chart-grid`, `chart-axis`). `BarList` y `Sparkline` son SVG propio porque Recharts pesa ~96 KB y solo lo bajan las páginas que lo importan.

## Rutas solo de desarrollo

El referente registra `/vista-previa/<nombre>` únicamente si `import.meta.env.DEV` (`apps/web/src/main.tsx`). El archivo vive en `apps/web/src/previews/`, que está en `.gitignore`. No commitear esas pantallas.

## Al terminar

`bun run typecheck` y, si se ve en el navegador, `bun run verificar`. La checklist visual está en la skill `interfaz`; los comandos, en `calidad`.
