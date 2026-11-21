---
name: capa-de-datos
description: Tipos, fixture y créditos de la demo de Vitrina (ficha, branding, landing, 9 posteos, 5 anuncios). Usar al cambiar un tipo, el kit ficticio o el costo de un crédito. No usar para scrapers ni CSV.
---

# Capa de datos

No hay backend ni APIs. El kit de la demo es un objeto en `apps/web/src/fixture.ts` (`DEMO_KIT_ID` es `la-esquina`). `loadKit(id)` devuelve `null` si el id no existe.

Los tipos están en `apps/web/src/types.ts`:

| Tipo | Qué guarda |
|---|---|
| `BusinessProfile` | `sourceUrl`, `name`, `category`, `address`, `whatsapp`, `reviews` |
| `BrandKit` | `palette`, `fonts`, `voice`, `logo` |
| `LandingPage` | Titular, resumen, CTA de WhatsApp, testimonios |
| `InstagramPost` | Exactamente 9, con `caption` y `visual` |
| `AdIdea` | Exactamente 5. `channel` es `instagram`, `facebook` o `google-ads` |
| `MarketingKit` | La ficha más branding, landing, posteos y anuncios |
| `Account` | `credits` y `plan` (`free` o `pro`) |

`apps/web/src/credits.ts` es la única cuenta que importa:

- Registrarse deja la cuenta en 30 créditos (`grantSignupCredits`).
- El primer kit es gratis (`chargeKit(account, true)` no descuenta).
- Un kit siguiente sale 10. Un ajuste sale 1 (`applyAdjustment`).
- Si no alcanzan los créditos, la función lanza. No deja el saldo a medias.

La pantalla del kit arranca con `grantSignupCredits()` y descuenta el ajuste en memoria. No se guarda en ningún lado. Al recargar, vuelven los 30.

## Qué no hacer

- Llamar a Google, a un modelo o a Mercado Pago desde la demo.
- Inventar una reseña o un teléfono que el fixture no trae y mostrarlo como si fuera del comercio.
- Mover los tipos a un paquete nuevo hasta que otra app los use.
- Guardar una clave en el cliente. No hay variables `VITE_` en la demo.
