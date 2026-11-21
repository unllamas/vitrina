# Vitrina: guía para agentes

Leer esto antes de escribir código. El detalle está en `.cursor/skills/<nombre>/SKILL.md`: cargar la que corresponda. Si no se cargan skills, se lee el mismo archivo.

Vitrina es una app de marketing para comercios: con el link de Google Business arma branding, una landing, 9 posteos y 5 ideas de anuncios. La versión actual es una demo de hackatón, con datos ficticios y sin APIs reales. El producto está en `README.md`.

La app es `apps/web` (Vite, React 19, TanStack Router). No es Next.js y no hay backend. Los tipos y el fixture viven en `apps/web/src/`, no en un paquete aparte. `packages/ui` tiene `Button`, `Input` y `Card`.

## Idioma

| Qué | Idioma |
|---|---|
| Variables, funciones, tipos, archivos, ids de eventos | Inglés (`brandKit`, `paste-link.tsx`) |
| Comentarios, docs, skills, cuerpo de los commits | Español |
| Tipo y ámbito del commit | Inglés (`feat(web): …`) |
| Textos de la interfaz y rutas públicas | Español |

Lo que se toca se acomoda en ese cambio: nombres viejos en español pasan a inglés, comentarios en inglés del archivo editado pasan al español.

## Skills

| Si vas a… | Skill |
|---|---|
| Crear un archivo, un paquete o una app, mover código o sumar una dependencia | `arquitectura` |
| Sumar o cambiar una página, una feature o un componente | `pagina-feature-componente` |
| Definir un tipo del kit, un fixture o cómo se carga un dato | `capa-de-datos` |
| Tocar estilos, tokens, un control o un texto visible | `interfaz` |
| Correr o escribir pruebas, lint o tipos | `calidad` |
| Crear una rama, commitear, pushear o abrir un PR | `git-y-prs` |

Una convención nueva se escribe en la skill que corresponda y se agrega una fila a esta tabla en el mismo commit.

## Reglas cortas

- Identificadores en inglés, comentarios en español, archivos en `kebab-case`. Paquetes con scope `@vitrina/*`.
- Dentro de `apps/web/src`, imports con `@/` y sin barrels. `packages/ui` no conoce el router ni los créditos. Una página no importa otra página.
- El link pegado va en la query (`?link=`). No hace falta un store global.
- El navegador no llama a Google. La ficha sale de `GET /api/business` con `GOOGLE_PLACES_API_KEY` en el server. Si falta la clave o falla la búsqueda, se muestra el fixture y un mensaje. No llamar a un modelo ni a Mercado Pago.
- Cada ajuste cuesta 1 crédito, el kit completo 10, el registro suma 30. Las funciones están en `apps/web/src/credits.ts`. No cambiar esos números sin actualizar el README y las pruebas.
- Solo Tailwind y componentes de `@vitrina/ui`. Zona de toque de 44 px. La chrome es neutra. La paleta de color del kit es del comercio, no de la app.
- Antes de cerrar un cambio de código: `bun run lint`, `bun run typecheck`, `bun test` y, si cambia la interfaz, `bun run build`. En un clon nuevo, `bun run hooks` una vez.
- Rama desde `dev`, PR a `dev`. No mergear salvo pedido explícito para ese PR. La CI corre en cada PR. Ver `git-y-prs`.
- Sin secretos en el diff. `GOOGLE_PLACES_API_KEY` va en `.env.local` o en el secreto de Pages, nunca en el cliente. Si el cambio suma otra API paga, decir qué costo tiene antes de hacerla.
