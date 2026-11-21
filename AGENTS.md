# Vitrina: guía para agentes

Leer esto antes de escribir código o documentación. El detalle está en las skills de `.cursor/skills/<nombre>/SKILL.md`: cargar la que corresponda (y más de una si la tarea cruza temas). Un agente que no carga skills lee el mismo archivo.

Vitrina todavía no tiene aplicación. El código, los comandos y las rutas de esta guía son el estándar de [mendoza-transparente](https://github.com/unllamas/mendoza-transparente), que este repo va a seguir. No inventar otra estructura. Si un comando de abajo falla, es porque el monorepo aún no existe: no improvisar un stack distinto para “hacerlo andar”.

## Idioma

| Qué | Idioma |
|---|---|
| Variables, funciones, tipos, archivos, ids de eventos | Inglés (`buildMunicipalStaff`, `list-search.tsx`) |
| Comentarios, docs, skills, cuerpo de los commits | Español |
| Tipo y ámbito del commit | Inglés (`feat(web): …`) |
| Textos de la interfaz y rutas públicas | Español (`/fuentes`) |
| Columnas de CSV publicados | Español, `snake_case`. No renombrarlas sin un plan |

Lo que se toca se acomoda en ese cambio: nombres viejos en español pasan a inglés, comentarios en inglés del archivo editado pasan a español.

## Skills

| Si vas a… | Skill |
|---|---|
| Crear un archivo, un paquete o una app, mover código o sumar una dependencia | `arquitectura` |
| Sumar o cambiar una página, una feature o un componente | `pagina-feature-componente` |
| Definir un tipo, un CSV, un recolector o la forma en que la web lee datos | `capa-de-datos` |
| Tocar estilos, tokens, un control o un texto visible | `interfaz` |
| Correr o escribir pruebas, lint, tipos o la verificación visual | `calidad` |
| Crear una rama, commitear, pushear o abrir un PR | `git-y-prs` |

Una convención nueva se escribe en la skill que corresponda y se agrega una fila a esta tabla en el mismo commit.

## Reglas cortas

- Identificadores en inglés, comentarios en español, archivos en `kebab-case`.
- Dentro de `apps/web/src`, imports con `@/` y sin barrels.
- `packages/ui` no conoce el router, PostHog ni los datos del sitio. Una página no importa otra página.
- Estado que se comparte (pestaña, búsqueda, ítem abierto) en la query, con `useUrlOption` / `useUrlText` de `apps/web/src/url-state.ts`. No con `useState`.
- Datos: crudo inmutable en `data/raw/`, CSV en `data/processed/`, JSON de la web generado por `apps/web/scripts/build-data.ts`. Descargar con `fetchAndArchive()` o `get()` + `archive()` de `@mt/core`.
- Solo Tailwind, componentes de `@mt/ui`. Zona de toque de 44 px. Tema claro por defecto.
- Antes de dar por terminado un cambio de código: `bun run lint`, `bun run typecheck` y, si hay cuentas o parsers, `bun test`. Si cambia la interfaz, además `bun run verificar`.
- Rama desde `dev`, PR a `dev`. No pushear directo a `main` y no mergear salvo pedido explícito para ese PR. Este repo hoy solo tiene `main`: ver la skill `git-y-prs`.
- Sin secretos en el diff. Si el cambio suma un workflow, una función o un servicio, decir de qué cupo gratis sale.
