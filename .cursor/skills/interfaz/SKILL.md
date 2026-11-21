---
name: interfaz
description: Convenciones de UI de Vitrina (Tailwind, BoardUI, 44 px, textos en español, paleta del comercio distinta de la chrome). Usar al estilar, al agregar un control o al cambiar algo que se ve.
---

# Interfaz

La app no tiene CSS de componente. `apps/web/src/styles.css` solo importa el paquete y le dice a Tailwind qué escanear:

```css
@import "@vitrina/ui/styles/app.css";
@source "./";
```

Los controles viven en `packages/ui`. Tema claro por defecto. El oscuro, si se ofrece, es la clase `.dark` en `<html>` y los tokens cambian solos. No escribir `dark:` a mano.

## Dos paletas, y no son la del referente

- **Chrome de Vitrina** (el producto donde se pega el link): la marca no está definida. No copiar el celeste de la bandera ni los tokens `accent-*` de Mendoza Transparente.
- **Kit del comercio:** paleta, tipografías y logo salen de `BrandKit`. Se aplican a la landing, a los posteos y a los anuncios. No se usan para pintar la app entera.

Hasta que la chrome tenga tokens propios, usar neutros del sistema (`text-text-primary`, fondos y bordes) y dejar el color de marca solo dentro del kit.

## Controles

Import por archivo desde `@vitrina/ui`:

- `Button` (`primary`, `secondary`, `ghost`, `danger`), alto 44 px. Para un `Link`, `buttonClassName({ variant })`.
- `IconButton` con `aria-label`.
- `Input` y `Textarea` para el link y para el ajuste en texto libre. En el celular, 16 px (`max-sm:text-base`), para que iOS no agrande la página. No bloquear el zoom.
- `PageHeader` y `Section` (el `id` de una sección de la landing es estable: `reseñas`, `contacto`).
- `cx` de `@vitrina/ui/lib/cx`. Tipografía compuesta (`text-body-medium`), no `text-sm font-medium` sueltos.
- Íconos `@remixicon/react`, variantes `Line`.

Un botón, un campo o una tarjeta no se arman con clases sueltas. Superficies: `tileVariants()` para un bloque que no se toca, `cardVariants()` para algo que lleva a otro lado, `listVariants()` para los 9 posteos o las 5 ideas.

Un control de BoardUI que falte se agrega desde `packages/ui` con la telemetría apagada (`BOARDUI_TELEMETRY_DISABLED=1 DO_NOT_TRACK=1 npx -y boardui@latest add <componente>`). No correr `boardui init`.

## Medidas

- Zona de toque de 44 px en filas, botones y campos.
- Sin scroll horizontal en 320, 375 y 1280 px.
- Mobile first. Nada importante depende del hover: en el teléfono no existe.
- La acción principal de la pantalla (pegar el link, pedir el ajuste) se ve sin scrollear en un celular de 375 px de ancho.
- Mientras el kit no llegó, un `Skeleton` con el alto real. No un «Cargando…» que empuja la página.

## Cómo se lee un kit

1. Primero el comercio (nombre y rubro) y el branding.
2. La landing, con el botón de WhatsApp visible y las reseñas como testimonios.
3. Los 9 posteos, en una lista, no en nueve páginas sueltas.
4. Las 5 ideas de anuncios. Cada una muestra canal, objetivo, público, texto, CTA y la pieza.
5. El ajuste en texto libre al lado de la parte que se está mirando, con el costo (1 crédito) escrito.

## Textos

Castellano rioplatense, el mismo registro del README («Pegá el link», «Pedí un ajuste»).

- Un nombre por cosa: posteo, anuncio, kit, crédito. No alternar con «publicación» o «pieza» para lo mismo.
- El botón empieza con un verbo («Armar el kit», «Pedir ajuste»).
- El error dice cómo seguir, al lado de lo que falló. Sin «¡Ups!».
- El placeholder es un ejemplo de link, no una orden. La instrucción va en `hint`.
- Sin «por favor» ni «exitosamente».

## Accesibilidad

WCAG 2.2 AA. `<button>` para acciones y `<a>` o `Link` para navegar. Foco visible. Tab, Enter, Espacio y Escape tienen que alcanzar. Un `h1` por página. El color del kit no es el único indicador de un estado: va con texto o ícono.
