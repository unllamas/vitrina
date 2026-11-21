---
name: interfaz
description: Convenciones de UI de Vitrina tomadas de packages/ui y de la web de mendoza-transparente (Tailwind, BoardUI, tokens, 44 px, textos en español). Usar al estilar, al agregar un control o al cambiar algo que se ve.
---

# Interfaz

La app no tiene CSS propio. `apps/web/src/styles.css` del referente solo importa el paquete y le dice a Tailwind qué escanear:

```css
@import "@mt/ui/styles/mt.css";
@source "./";
```

Los tokens y los controles viven en `packages/ui`. Tema claro por defecto. El oscuro es la clase `.dark` en `<html>` (se guarda en `localStorage` bajo `boardui:theme`); los tokens cambian solos. No escribir variantes `dark:` a mano.

Vitrina todavía no tiene el paquete. Al crearlo, copiar este contrato en lugar de empezar con otra librería de estilos.

## Qué se usa

Import por archivo, como en `apps/web/src/pages/deuda.tsx`:

- `PageHeader`, `Section` desde `@mt/ui/components/section`.
- `StatTile` desde `@mt/ui/components/stat-tile`.
- `Alert` desde `@mt/ui/components/alert`.
- `Button`, `buttonClassName` desde `@mt/ui/components/base/buttons/button`. `IconButton` exige `aria-label`.
- `cx` desde `@mt/ui/lib/cx` para juntar clases. Entiende la tipografía compuesta (`text-body-medium`, `text-title-3-semibold`). No usar `cva` ni tamaños sueltos (`text-sm font-medium`).
- Íconos `@remixicon/react`, variantes `Line`. Decorativos en `text-foreground-icon-secondary`.

`Button`: `primary` (la acción principal), `secondary` (el resto), `ghost`, `danger`. Alto `large` (44 px) por defecto. Para un `Link` del router, `className={buttonClassName({ variant: "secondary" })}`.

Superficies, no clases inventadas:

| Se ve | Clases / componente |
|---|---|
| Cifra o bloque que no se toca | `tileVariants()` — plano, borde fino, `rounded-xl` |
| Tarjeta que lleva a otro lado | `cardVariants()` — blanca, sombra, flecha en `text-text-link` |
| Lista de filas | `listVariants()` + `listRowVariants()`, alto 44 px |
| Etiqueta que no se toca | `Chip`, `rounded-md` |
| Aviso que cambia cómo se lee el dato | `Alert` `warning` (ámbar, con ícono) |
| Aclaración de método | `Alert` `note` |

Un botón, un campo o una tarjeta no se arman con utilidades sueltas. Si falta una variante, se agrega en `packages/ui` y se usa en las dos pantallas.

## Color y tipo

La identidad del referente es celeste y azul, definida en `packages/ui/src/styles/mt.css`:

- `accent-400` (`#74ACDF`) celeste de la bandera, para lo resaltado en oscuro.
- `accent-600` (`#1F6DB5`) azul de la marca: links, botón principal, lo resaltado en claro.
- Texto: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`.
- Acciones secundarias: `bg-background-action` y `text-text-action`.
- Lo que se toca: `bg-background-interactive`.

No sumar otro color de acento. Verde, amarillo y rojo solo como estado, siempre con texto o ícono al lado. Contraste AA: 4,5:1 el texto, 3:1 bordes y marcas, medido sobre el fondo real (la página es `background-full`, un gris muy tenue, no blanco puro).

## Medidas que `bun run verificar` controla

- Zona de toque mínima de 44 px (`min-h-11`) en filas, botones y campos.
- Botón de solo ícono: 44 × 44, `IconButton`, con nombre accesible. La acción de la página va en `PageHeader` (`action`), alineada con la primera línea, no en una fila debajo del texto.
- Encabezado del sitio, de las hojas y del buscador: 56 px (`h-14`).
- Sin scroll horizontal en 320, 360, 375, 390, 1024 y 1280 px. Hay un `overflow-x: clip` de red, pero se corrige la causa.
- Campos de formulario a 16 px en el celular (`max-sm:text-base`, ya en `Input`). No bloquear el zoom.
- Menú hamburguesa por debajo de 1024 px. Con el menú abierto, solo scrollea el menú (`useScrollLock` de `@mt/ui/hooks/use-scroll-lock`).
- Cifras, fechas y montos en una sola línea. La unidad va aparte y en chico. Montos grandes en palabras: «$ 1.673 millones», no «M».

Mobile first. `hover:` en Tailwind 4 ya no aplica en un dispositivo sin mouse: nada importante puede depender del hover. La flecha de una fila que navega se ve siempre.

## Composición de una pantalla

Orden que usa el referente en las páginas de datos:

1. `WithBreadcrumbs` pegado al encabezado (`apps/web/src/components/breadcrumbs.tsx`). Una sola línea arriba del título; el último tramo es la página actual.
2. `PageHeader` con un título que se entiende solo. Una tarjeta, una cifra y una frase.
3. `Section` por cada bloque, con `id` estable. El título es el link a `#id`.
4. Lo informativo arriba (tarjetas, gráfico) y la tabla cruda abajo, o en `/datos/<fuente>`.
5. `FuentesOficiales` siempre al final (`#fuentes`): organismo, sitio oficial, copia archivada. No repetir «Fuente:» en medio de la página.
6. Término difícil: `Term` (`apps/web/src/components/glossary-term.tsx`) leyendo `apps/web/src/glossary.ts`. La definición se escribe una vez.

Hojas de detalle con el id en la URL (`?proceso=`, `?proveedor=`), componente `DetailSheet`, montado una vez en el layout. Al abrir o cerrar, `resetScroll: false`. El router entrega los ids numéricos como número: pasarlos a texto antes de usarlos.

Mientras un bloque no llegó, `Skeleton` / `SkeletonText` con el alto real. No un «Cargando…» que después empuja la página. Aparece recién a los 150 ms.

## Textos

Castellano rioplatense, llano, sin jerga.

- Un nombre por cosa en todo el sitio. Buscar el término antes de inventar un sinónimo.
- El botón empieza con un verbo («Descargar CSV»). El de solo ícono nombra la acción (`Cerrar`), no el dibujo.
- El link dice adónde lleva. Nada de «acá» o «ver más» sueltos.
- El error dice cómo seguir y está al lado de lo que falló. Sin «¡Ups!».
- La pantalla vacía dice qué es ese lugar y qué se puede hacer. Si el vacío es un filtro, ofrecer borrarlo.
- El placeholder es un ejemplo (`nombre@correo.com`), no una orden. La instrucción va en `hint`.
- Sin «por favor» ni «exitosamente».

## Accesibilidad

WCAG 2.2 AA. `<button>` para acciones y `<a>` / `Link` para navegar. Nunca un `div` con `onClick`. Foco visible: no apagar `:focus-visible` salvo que el control ya tenga otro indicador (el anillo del campo). Tab, Enter, Espacio y Escape tienen que alcanzar. Un `h1` por página, encabezados en orden, un solo `<main>`. Gráficos y mapas con `aria-label`. Texto que aparece solo (cantidad de resultados) con `role="status"`.

## Gráficos

Elegir la forma por la pregunta: evolución larga → `LineChart`; montos por año → `ColumnChart`; suba o baja por período → `ChangeChart` (el signo va escrito); ranking → `BarList` con `total` explícito, para que la primera barra no parezca el 100 %. Colores de token, sin degradé. Sin animación si `use-reduced-motion` está activo. Dos gráficos chicos, en `lg:grid-cols-2`; lo que necesita el ancho (un mapa, una serie con bandas) sigue a una columna.
