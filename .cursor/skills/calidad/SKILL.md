---
name: calidad
description: Pruebas, lint y tipos de Vitrina (bun test, Biome, tsc). Usar al escribir una prueba, antes de commitear, o cuando un chequeo falla.
---

# Calidad

Desde la raíz, con Bun 1.4.2:

| Comando | Qué cubre |
|---|---|
| `bun run lint` | `biome check .` |
| `bun run format` | `biome check --write .` |
| `bun run typecheck` | `tsc --noEmit` en `@vitrina/ui` y `@vitrina/web` |
| `bun test` | `apps/web/src/*.test.ts` |
| `bun run build` | `vite build` de la web |

Biome 2.5.15: 2 espacios, comillas dobles, punto y coma, coma final, ancho 140, imports ordenados, archivos en `kebab-case`. El preset es `recommended`. Una excepción lleva `// biome-ignore <regla>: <motivo>` en la línea de arriba.

No hay dependency-cruiser. Los hooks de git están en `lefthook.yml` (`bun run hooks`): Biome antes del commit y commitlint en el mensaje. La CI repite lint, tipos, pruebas y build. No reemplazar Biome por ESLint ni `bun test` por Jest o Vitest.

## Pruebas

`bun:test`, al lado del código. No llaman a la red.

- `credits.test.ts`: el registro suma 30, el primer kit no descuenta, el siguiente descuenta 10, el ajuste descuenta 1, y sin saldo la función lanza.
- `fixture.test.ts`: el kit de demostración tiene 9 posteos y 5 anuncios, y un id desconocido devuelve `null`.

Si cambia un costo o la cantidad de posteos, se actualiza la prueba y el README en el mismo cambio.

## Antes de cerrar

Correr lint, typecheck, test y, si cambió la interfaz, el build. Decir cómo terminó cada uno.
