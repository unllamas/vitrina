---
name: capa-de-datos
description: Cómo se modela, archiva, normaliza y lee un dato en Vitrina, siguiendo data/raw, data/processed, sources.yaml y los loaders de mendoza-transparente. Usar al agregar una fuente, un CSV, un tipo, un scraper o la carga de datos de una página.
---

# Capa de datos

El referente trata el dato como un archivo auditable, no como una respuesta en vivo. La web lee JSON generado en el build. Vitrina no tiene `data/` todavía: el primer dataset entra con este recorrido, no con un `fetch` suelto dentro del componente.

## Recorrido

```
fuente oficial
  → packages/scrapers/src/sources/<id>.ts
  → data/raw/<id>/<AAAA-MM-DD>/ + manifest.jsonl
  → data/processed/<id>/<tabla>.csv + <tabla>.meta.json
  → apps/web/scripts/temas/<tema>.ts
  → apps/web/public/data/temas/<tema>.json
  → loader de la ruta (loadTema / loadJson)
```

`sources.yaml` describe la fuente. `data/curado/` guarda lo que una persona escribió y ningún archivo oficial dice solo.

## Catálogo

Una entrada en `sources.yaml` por fuente. Campos que la web y el build leen: `id`, `nombre`, `descripcion`, `organismo`, `url`, `formato`, `frecuencia`, `dificultad` (`facil` | `media` | `dificil`), `estado` (`pendiente` | `activo` | `roto`). El `id` es el nombre de la carpeta en `data/raw/` y `data/processed/`. Al cerrar un recolector, la sesión que integra actualiza `estado`.

## Crudo

Funciones en `packages/core/src/fetch.ts`, reexportadas por `@mt/core`:

| Función | Cuándo |
|---|---|
| `get(url, init?, retries?)` | Pedido con User-Agent de navegador, timeout de 120 s, 3 reintentos y pausa de 500 ms. Sin ese User-Agent varios sitios oficiales responden 403 |
| `archive(source, filename, bytes, url)` | Escribe el archivo y una línea en el manifest |
| `fetchAndArchive(source, url, filename)` | Las dos. Devuelve `null` si el contenido no cambió |
| `fetchOrReuse(source, url, filename)` | Devuelve lo ya archivado o lo descarga una vez |

Reglas:

- `data/raw/<id>/<AAAA-MM-DD>/<archivo>` es de solo agregar. No editar ni borrar. Si el mismo día llega otra versión, el nombre lleva la hora (`archivo.HHMMSS.ext`).
- `manifest.jsonl`: una línea JSON por descarga, tipo `ManifestEntry` (`filename`, `path`, `url`, `fetched_at`, `sha256`, `bytes`, `gzip`).
- Más de 1 MB (`GZIP_THRESHOLD`) se guarda con gzip. GitHub rechaza archivos de más de 100 MB: si algo supera unos 50 MB comprimido, avisar antes de commitear.
- HTML se compara con `huella()` (texto visible, links e imágenes), no con el sha256 de la página entera, para no archivar la misma nota por un nonce distinto.
- Pedidos en serie, nunca un abanico en paralelo contra el mismo dominio. `sleep` está en `packages/core/src/util.ts`.
- `PROXY_AR` solo para los hosts listados en `HOSTS_CON_PROXY`. No inventar un proxy para el resto.
- No guardar datos personales (documento, domicilio, familiares). Si el original los trae, se archiva ya redactado y no se manda a Wayback.

## Normalizado

`writeProcessed(source, filename, rows, columns?)` y `readProcessed(source, filename)` en `packages/core/src/csv.ts`. El CSV es UTF-8, RFC 4180, columnas en `snake_case` español. Esas columnas son un contrato: renombrarlas exige `!` en el commit y un pie `BREAKING CHANGE:`.

- Una fila por observación. Montos en pesos nominales (la unidad real, no “millones”, salvo que la columna lo diga). La conversión a valores de hoy se hace en `scripts/temas/`, no en el CSV.
- Al lado, `<archivo>.meta.json`. En la web el tipo es `Diccionario` (`apps/web/src/types.ts`): `titulo`, `descripcion`, `columnas` (`ColumnaDict`: `etiqueta`, `tipo`, `descripcion`, `oculta`, `moneda`, `escala`, `unidad`, `valores`), `orden`, `agruparPor`, `grupoInicial`, `vista`.
- El scraper reescribe el CSV completo y es idempotente: dos corridas seguidas no duplican filas ni archivos crudos.
- Tipos de celda al serializar: `string | number | boolean | null`. `Row` está en `csv.ts`.

Otros helpers de `@mt/core` que hay que usar antes de escribir uno nuevo: `parseArNumber`, `finiteNumber`, `collapseSpaces`, `normalizeMunicipio`. Texto de PDF: `pdfText` y `pdfPages` en `packages/scrapers/src/lib/pdf.ts`.

## Curado

`data/curado/*.yaml` es editorial. Cada afirmación cita la fuente oficial y la fecha en que se revisó. Si la fuente no lo dice, no se completa por inferencia: se muestra el hueco. El referente usa este directorio para lo que no está publicado, correcciones entre fuentes que no coinciden y fichas revisadas a mano.

## Lo que lee el navegador

`apps/web/scripts/build-data.ts` (`bun run data`, y también el `dev` y el `build` de `@mt/web`) escribe en `apps/web/public/data/`:

| Archivo | Tipo en `types.ts` | Quién lo pide |
|---|---|---|
| `index.json` | `DataIndex` | `loadIndex()`, solo `/fuentes` y `/datos` |
| `fuentes.json` | `SourceCatalog` | `loadSources()`, una vez por visita |
| `<fuente>/<tabla>.preview.json` | `Preview` (`columns`, `rows`) | `loadPreview()` |
| `temas/<tema>.json` | la interfaz del tema | `loadTema<T>(tema)` |
| cualquier otro JSON | genérico | `loadJson<T>(path)` |

Todas viven en `apps/web/src/lib.ts` y lanzan si la respuesta no es `ok`. No leer `data/processed` desde un componente: el navegador no tiene esos archivos, y Vite tampoco los publica.

En desarrollo, el plugin `liveData` de `apps/web/vite.config.ts` regenera `public/data` cuando cambian `data/processed`, `data/curado`, `sources.yaml` o `apps/web/scripts`, y recarga el browser. `MT_NO_DATA_WATCH=1` lo apaga (lo usa `bun run verificar`).

## Recolector nuevo

1. `packages/scrapers/src/sources/<id>.ts` exporta `run(args: string[])`. El CLI (`packages/scrapers/src/cli.ts`) lo importa por el nombre del archivo. Se corre con `bun run scrape <id>`.
2. Entrada en `sources.yaml` con `estado: pendiente` hasta que el CSV esté bien, después `activo`.
3. Prueba del parser al lado: `packages/scrapers/src/sources/<id>.test.ts`, con un fixture chico, no con la descarga real. `bun test` la toma.
4. Si la página lo muestra, el script de tema, el tipo, la ruta y el diccionario van en el mismo cambio.
5. Tipos del paquete: `bunx tsc --noEmit` dentro del paquete, o `bun run typecheck` desde la raíz.

Para mirar un archivo ya bajado sin pegarlo entero en el contexto: `bun run crudo <url|fuente/archivo>` (`packages/scrapers/src/inspect.ts`). Una sección de un documento largo: `bun run seccion <documento> "<título>"`.

## Qué no hacer

- `fetch` directo a un sitio oficial desde la web o desde un script nuevo, salteando `@mt/core`.
- Editar un archivo de `data/raw/`.
- Calcular un total distinto en la página y en `scripts/temas/`. La cifra sale una vez, en el script, y la página la muestra.
- Inventar un valor que la fuente no trae. Si dos fuentes no coinciden, se muestran las dos.
