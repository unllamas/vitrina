---
name: capa-de-datos
description: Tipos del kit, fixture de respaldo y consulta a Google Places (New) detrás de /api/business. Usar al cambiar un tipo, el parser de links, el fixture o el costo de un crédito. No usar para scrapers ni CSV.
---

# Capa de datos

El navegador no llama a Google. Pide `GET /api/business?q=` con el link o el nombre. La clave `GOOGLE_PLACES_API_KEY` la lee solo el server.

| Dónde | Qué es |
|---|---|
| `apps/web/functions/api/business.ts` | Cloudflare Pages Function |
| `apps/web/vite.config.ts` | El mismo handler, en `bun run dev` y en `vite preview` |
| `apps/web/src/places/parse-business-query.ts` | Parser puro. Ahí van las pruebas de links |
| `apps/web/src/places/resolve-business.ts` | Redirects, Places API (New) y el mapeo a `BusinessProfile` |
| `apps/web/src/places/personalize-kit.ts` | Pone el comercio real sobre la plantilla de posteos y anuncios |
| `apps/web/src/fixture.ts` | Kit de demostración (`la-esquina`) si no hay clave o Google falla |

## Qué link se acepta

- `google.com/maps/place/...`: nombre en el path, coordenadas en `@lat,lng` o `!3d!4d`, feature id `!1s0x...:0x...`.
- `query_place_id=ChIJ...` o `!1sChIJ...`: Place Details directo.
- `maps.app.goo.gl`, `goo.gl` y `g.co`: el server sigue el redirect y vuelve a parsear.
- Un nombre suelto (`Panadería La Esquina, Godoy Cruz`) o `?q=` / `?query=` de Maps: Text Search.

Sin clave, sin resultado o si Google rechaza la llamada, la respuesta es `{ source: "fixture", message, business: null }` y la pantalla lo dice. Con resultado, `{ source: "places", business, raw }`. `raw` no incluye la clave. La pantalla lo muestra en «Datos del comercio» y lo baja como `comercio.json`.

La máscara pide teléfono, sitio, horario, puntuación, reseñas, componentes de dirección y hasta 4 fotos. Si esa máscara da 400, se reintenta sin reseñas ni fotos. Cada foto del kit es `/api/business-photo?name=places/…/photos/…`: el server la pide a Google con la clave y devuelve la imagen. El JSON no lleva la clave.

`mapPlace` (`apps/web/src/places/map-place.ts`) llena los campos opcionales que usa el rediseño: `rating`, `reviewCount`, `hours` (textos y períodos), `photos`, `geo`, `mapsUrl`, `phone`, `locality`, `services`, y en la landing `whatsappPrefill`, `titleTag`, `metaDescription` y `schemaType`. `benefits` queda en la plantilla.

## Tipos

Siguen en `apps/web/src/types.ts`. `BusinessProfile` suma, todos opcionales para el fixture: `phone`, `website`, `hours`, `rating`, `reviewCount`, `photos`, `location`. `whatsapp` son los dígitos del teléfono, para el link `wa.me`.

Los 9 posteos y las 5 ideas no se generan con un modelo: `personalizeKit` reemplaza el nombre de la plantilla y usa el rubro en el público del anuncio.

## Créditos

`apps/web/src/credits.ts`:

- Registrarse deja la cuenta en 30 créditos.
- El primer kit es gratis. Un kit siguiente sale 10. Un ajuste sale 1.
- Sin saldo, la función lanza. No deja el saldo a medias.

## Qué no hacer

- Prefijo `VITE_` en la clave de Places, ni devolverla en el JSON.
- Inventar reseñas que Google no trajo cuando `source` es `places`.
- Llamar a un modelo o a Mercado Pago desde esta capa.
- Mover los tipos a otro paquete hasta que otra app los use.
