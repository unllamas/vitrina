---
name: calidad
description: Pruebas, lint y tipos para Vitrina con bun test, Biome y TypeScript estricto. Usar al escribir una prueba, antes de commitear, o cuando un chequeo falla.
---

# Calidad

Estos comandos se agregan con el monorepo. Hasta que exista el `package.json`, no reemplazarlos por Jest, ESLint ni Vitest, y no marcarlos como corridos.

## Qué correr

| Momento | Comando | Qué cubre |
|---|---|---|
| Siempre que haya código | `bun run lint` | Biome y las reglas de arquitectura |
| Siempre que haya código | `bun run typecheck` | `tsc --noEmit` en cada workspace |
| Créditos, cantidades del kit, textos | `bun test` | Todo `*.test.ts` |
| Una sola prueba | `bun test packages/kit/src/credits.test.ts` | Ese archivo |
| Dejar el formato | `bun run format` | `biome check --write .` |

`bun run lint:arch` es dependency-cruiser sobre `apps/web/src` y `packages`. Las reglas están en la skill `arquitectura`. No incluir `apps/panel` ni `apps/votacion`: no son de este repo.

## Formato

Biome 2.5.15, como el referente:

- 2 espacios, comillas dobles, punto y coma, coma final, ancho 140, imports ordenados.
- Nombres de archivo en `kebab-case` ASCII.
- No hace falta excluir `data/`: Vitrina no tiene ese árbol.
- Reglas recomendadas. Si se copia el `biome.json` del referente, se pueden dejar apagadas las que ya trae (`noNonNullAssertion`, `noArrayIndexKey`, `noUndeclaredEnvVars`). No apagar más sin anotarlo en `biome.json` y acá.
- Excepción: `// biome-ignore <regla>: <motivo>` en la línea de arriba.

En CI, `bunx biome ci .`.

## Pruebas

`bun test` con `bun:test`. El archivo va al lado del código. No hace falta un runner de componentes para la demo.

Lo que sí se prueba, con un fixture chico y sin red:

- Un kit tiene 9 posteos y 5 anuncios.
- El kit completo descuenta 10 créditos y un ajuste descuenta 1.
- Registrarse suma 30, y el primer kit sin registro no descuenta.
- Un ajuste no se aplica si no hay créditos.

```ts
import { describe, expect, test } from "bun:test";
import { applyAdjustment } from "./credits.ts";

describe("applyAdjustment", () => {
  test("un ajuste descuenta un crédito", () => {
    expect(applyAdjustment({ credits: 30 }).credits).toBe(29);
  });
});
```

Una prueba no llama a Google, a un modelo ni a Mercado Pago.

## Hooks y CI

Cuando estén, lefthook (`bun run hooks`) corre Biome, arquitectura y tipos antes del commit, y commitlint en el mensaje.

La CI, en cada PR y en `main` y `dev`: `bun install --frozen-lockfile`, `biome ci`, `lint:arch`, `typecheck`, `bun test` y el build de `apps/web`. Sin el paso de datos ni el build del panel o de votación. Bun 1.4.2.

Recorrer a mano, en 375 px y en 1280 px, cualquier pantalla que se haya tocado. El script `bun run verificar` del referente es de ese otro sitio; se porta solo si hace falta, y sin las variables `MT_*`.

## Antes de cerrar

Decir qué se corrió y cómo terminó. Si el monorepo todavía no está, decirlo.
