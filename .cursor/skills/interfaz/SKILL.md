---
name: interfaz
description: Convenciones de UI de Vitrina (Tailwind 4, tokens neutros, Button, Input, Card, 44 px, textos en español). Usar al estilar, al agregar un control o al cambiar algo que se ve.
---

# Interfaz

`apps/web/src/styles.css` importa los tokens y le dice a Tailwind qué escanear:

```css
@import "@vitrina/ui/styles/app.css";
@source ".";
@source "../../../packages/ui/src";
```

Los tokens están en `packages/ui/src/styles/app.css`: `canvas`, `surface`, `ink`, `muted`, `line`, `danger`. Son grises. No se copia la paleta celeste de Mendoza Transparente.

La paleta de color del comercio (crema, terracota, café, oliva en el fixture) se usa solo dentro del kit, en el placeholder del logo y en las muestras. No pinta botones ni el fondo de la app.

## Controles

- `Button` (`primary` o `secondary`) y `buttonClassName` para un `<a>`. Alto mínimo 44 px (`min-h-11`), texto de 16 px.
- `Input` lleva `label`. El hint y el error quedan asociados con `aria-describedby`.
- `Card` es un bloque con borde, para lo que no se toca.
- Un control nuevo que sirva en más de una pantalla se agrega en `packages/ui`. No sumar otra librería para eso.

El campo del link y el textarea del ajuste usan 16 px para que iOS no agrande la página. No se bloquea el zoom. El foco visible es el anillo global de `app.css`. No se apaga.

## Textos

Castellano rioplatense, el mismo registro del README («Pegá el link», «Pedir ajuste»).

- Un nombre por cosa: posteo, anuncio, kit, crédito.
- El botón empieza con un verbo.
- El error dice cómo seguir y está al lado del campo. Sin «¡Ups!».
- El placeholder es un ejemplo de link, no una orden.

## Accesibilidad

Un `h1` por página. `<button>` para acciones y `<a>` para navegar (WhatsApp es un link). La zona de toque de filas, botones y campos es de 44 px. El color del kit no es el único indicador: el nombre del color va escrito al lado.
