# Vitrina: guía para agentes

Leer esto antes de escribir código. El detalle está en `.cursor/skills/<nombre>/SKILL.md`: cargar la que corresponda. Si no se cargan skills, se lee el mismo archivo.

Vitrina es una app de marketing para comercios: con el link de Google Business arma branding, una landing, 9 posteos y 5 ideas de anuncios. La versión actual es una demo de hackatón, con datos ficticios y sin APIs reales. El producto está en `README.md`. El código de la demo todavía no está en el repo.

La forma de trabajar sale de mendoza-transparente (monorepo, Bun, Vite, React). No se traen su dominio ni sus apps: no hay scrapers, `data/raw`, panel, votación ni variables `MT_*`.

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
- Lo que se comparte (posteo abierto, anuncio elegido) va en la query. No hace falta un store global.
- La demo lee un fixture. No llamar a Google, a un modelo ni a Mercado Pago hasta el ítem del roadmap que lo pida.
- Cada ajuste cuesta 1 crédito, el kit completo 10, el registro suma 30. No cambiar esos números sin actualizar el README.
- Solo Tailwind y componentes de `@vitrina/ui`. Zona de toque de 44 px. La paleta celeste del referente no es la marca de esta app.
- Antes de cerrar un cambio de código: `bun run lint`, `bun run typecheck` y, si hay una cuenta o un texto armado, `bun test`.
- Rama desde `dev`, PR a `dev`. No mergear salvo pedido explícito para ese PR. Hoy el repo solo tiene `main`: ver `git-y-prs`.
- Sin secretos en el diff. Si el cambio suma una API paga, decir qué costo tiene antes de hacerla.
