---
name: calidad
description: Pruebas, lint, tipos y verificación visual con los comandos reales de mendoza-transparente (bun test, Biome, dependency-cruiser, lefthook, CI). Usar al escribir una prueba, antes de commitear, o cuando un chequeo falla.
---

# Calidad

Estos comandos existen en la raíz de mendoza-transparente. En Vitrina van a existir cuando esté el `package.json`. Hasta entonces, no reemplazarlos por Jest, ESLint ni Vitest.

## Qué correr

| Momento | Comando | Qué cubre |
|---|---|---|
| Siempre que haya código | `bun run lint` | Biome (`biome check .`) y `bun run lint:arch` |
| Siempre que haya código | `bun run typecheck` | `turbo run typecheck`: `tsc --noEmit` en cada workspace |
| Cuentas, parsers, CSV, texto | `bun test` | Todo `*.test.ts` del repo |
| Una sola prueba | `bun test packages/core/src/fetch.test.ts` | El archivo, o `bun test scripts` para una carpeta |
| Cambió lo que se ve | `bun run verificar` | `scripts/verificar-web.ts` |
| Cambió cómo carga una página | `bun run medir` | LCP, FCP y CLS sobre el build |
| Dejar el formato | `bun run format` | `biome check --write .` |

`bun run lint:arch` es dependency-cruiser sobre `apps/web/src`, `apps/web/scripts`, `apps/panel/src`, `apps/votacion/src` y `packages`, con `.dependency-cruiser.cjs`. Las reglas están en la skill `arquitectura`.

## Formato y lint

`biome.json` del referente (schema 2.5.15):

- 2 espacios, comillas dobles, punto y coma, coma final, ancho de línea 140, imports ordenados (`organizeImports`).
- Nombres de archivo en `kebab-case` ASCII (`useFilenamingConvention` en error).
- No entra `data/`, `dist/`, `public/data`, JSON, Markdown, YAML ni `apps/social/vendor`.
- Reglas recomendadas. Apagadas a propósito: `noNonNullAssertion`, `noAssignInExpressions`, `noArrayIndexKey`, `noUndeclaredEnvVars`, `useIterableCallbackReturn`, `useSemanticElements`, `noLabelWithoutControl`. No apagar más sin anotarlo en `biome.json` y en esta skill.
- Excepción puntual: `// biome-ignore <regla>: <motivo>` en la línea de arriba. Sin motivo no se ignora.

En CI el equivalente es `bunx biome ci .` (falla si el formato no está aplicado).

## Pruebas

`bun test` usa `bun:test`. No hay Testing Library ni un runner de componentes: se prueban funciones puras.

El archivo va al lado del código: `packages/core/src/fetch.test.ts` prueba `fetch.ts`, `apps/web/src/summaries.test.ts` prueba `summaries.ts`. dependency-cruiser excluye `*.test.ts`, así que una prueba puede importar lo que el archivo de producción no debe.

Forma que ya usa el referente:

```ts
import { describe, expect, test } from "bun:test";
import { huella } from "./fetch.ts";

describe("huella", () => {
  test("un cambio de votos cuenta como cambio", () => {
    expect(huella("p.html", encode(page("356")))).not.toBe(huella("p.html", encode(page("357"))));
  });
});
```

Qué vale la pena cubrir: un parser (HTML, PDF, planilla), una cifra que se publica, un slug, un texto que se arma una sola vez para la ficha y para el SEO. El fixture es chico y está en el archivo. No se descarga la fuente real dentro de la prueba.

Una prueba que necesita red, Chrome o un secreto no entra en `bun test`. Eso es `verificar` o un script aparte.

## Verificación visual

`bun run verificar` levanta la web y abre Chrome sin extensiones (`CHROME_PATH`, o la ruta de macOS que trae `scripts/verificar-web.ts`). Recorre las páginas en 320, 360, 375, 390, 1024 y 1280 px y falla si:

- hay scroll horizontal;
- la consola muestra un error o un warning, también al abrir una hoja;
- con el menú móvil abierto la página de atrás sigue scrolleando;
- un campo en ancho de celular tiene menos de 16 px.

Usa el puerto 5199. Si está ocupado: `MT_VERIFY_PORT=5299 bun run verificar`. Pone `MT_NO_DATA_WATCH=1` para que un scraper escribiendo en paralelo no recargue la página a mitad de la corrida. En CI el workflow exporta `CHROME_PATH=/usr/bin/google-chrome`.

`bun run medir` (`scripts/measure-vitals.ts`) mide LCP, FCP y CLS en celular y escritorio. Puerto por defecto 5198 (`MT_VITALS_PORT`).

## Hooks

`lefthook.yml`, se instala una vez con `bun run hooks`:

- `pre-commit`, en paralelo, sobre lo staged: `biome check` en `*.{ts,tsx,js,cjs,css}`, `bun run lint:arch` y `bun run typecheck` si hay `*.{ts,tsx}`.
- `commit-msg`: `bunx commitlint --edit` con `commitlint.config.mjs`.

Si el hook rechaza el mensaje, se corrige el mensaje. No se saltea el hook para commitear igual.

## CI del referente

`.github/workflows/ci.yml`, en cada push a `main` y `dev`, y en cada pull request. Job `verificar`, Ubuntu, timeout 15 minutos, Bun 1.4.2:

1. `bun install --frozen-lockfile`
2. `bunx biome ci .`
3. `bun run lint:arch`
4. `bunx turbo run typecheck`
5. `bun test`
6. En `apps/web`: `bun run data`, `vite build`, `bun scripts/seo.ts`
7. Build de `apps/panel` y de `apps/votacion`
8. `bun scripts/verificar-web.ts`

`.github/workflows/titulo-del-pr.yml` valida el título del PR con la misma config de commitlint.

Al armar la CI de Vitrina, copiar esta lista y sacar los builds de las apps que no existan. No agregar otro workflow que corra en cada push si solo mira una carpeta: usar `paths:`.

## Antes de cerrar la tarea

Decir qué se corrió y cómo terminó. Si un comando no se pudo correr porque el monorepo todavía no está, decirlo. No marcar la verificación como hecha de memoria.
