---
name: pagina-feature-componente
description: Cómo se agrega una página o un componente en apps/web (rutas en main.tsx, páginas en pages/). Usar al crear o modificar una pantalla, una ruta o un componente.
---

# Página y componente

Las rutas están en `apps/web/src/main.tsx` con `createRootRoute` y `createRoute`. No salen del nombre del archivo y no se usa el plugin de file routes.

| Ruta | Página | Qué muestra |
|---|---|---|
| `/` | `pages/home.tsx` | El campo para pegar el link de Google Business |
| `/kit/$kitId` | `pages/kit.tsx` | El kit ficticio. El link pegado va en `?link=` |

`loadKit` está en `fixture.ts`. Un id que no existe hace `throw notFound()`.

## Sumar una página

1. El tipo nuevo va en `apps/web/src/types.ts`.
2. La ruta se declara en `main.tsx` y se cuelga de `rootRoute`. Una ruta estática se declara antes que una con parámetro.
3. La página va en `pages/<nombre>.tsx`, lee los datos con `getRouteApi` y no importa otra página.
4. Si hace falta un control nuevo y no conoce el router, va a `packages/ui`. Si conoce el router, va a `apps/web/src/components/`.

El link que se puede compartir va en la query, como `?link=`. El `hash` (`#posteos`, `#anuncios`) baja a una sección.

## Componentes que hay

`Button` y `buttonClassName`, `Input`, `Card`, en `@vitrina/ui/components/<nombre>`. Un link que tiene que verse como botón usa `buttonClassName` en un `<a>`, no un `<button>`.

React Aria y BoardUI no están instalados. No correr `boardui init` ni agregar otra librería de controles para una variante: se suma al componente que ya existe.
