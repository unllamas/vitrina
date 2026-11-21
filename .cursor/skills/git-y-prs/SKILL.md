---
name: git-y-prs
description: Ramas, commits y pull requests como los trabaja mendoza-transparente (dev, Conventional Commits, squash, publicación a main). Usar al crear una rama, commitear, pushear o abrir un PR. No mergear salvo un pedido explícito para ese PR.
---

# Git y pull requests

## Estado de Vitrina

Hoy el repo solo tiene `main`, con el commit inicial. No hay `dev`, ni plantilla de PR, ni hooks. El acuerdo de trabajo, copiado del referente, es el de abajo. Se activa con el primer cambio de producto: crear `dev` desde `main` y, a partir de ahí, no pushear código directo a `main`.

La documentación inicial puede estar en `main` porque el repo estaba vacío y se pidió publicarla ahí. Eso no habilita el siguiente push directo.

## Ramas

| Rama | Sale de | Entra a | Para qué |
|---|---|---|---|
| `feat/…`, `fix/…`, `datos/…` | `dev` | PR a `dev` | Una tarea |
| `hotfix/…` | `main` | PR a `main`, y después back merge a `dev` | Algo roto en producción que no puede esperar |
| `dev` | — | PR a `main` cuando se publica | Integración. En el referente, Cloudflare la muestra como vista previa |
| `main` | — | — | Producción. Cada push del referente publica el sitio |

Nombres en `kebab-case`, sin tildes, cortos: `feat/pedidos-por-municipio`.

```bash
git switch dev && git pull
git switch -c feat/mi-cambio
# commits
git fetch origin && git rebase origin/dev
git push -u origin feat/mi-cambio
```

Después del rebase, si entraron cambios en `AGENTS.md` o en `.cursor/skills/`, leerlos antes de seguir: la tarea tiene que cumplir lo que acaba de entrar.

## Commits

Conventional Commits. Tipo y ámbito en inglés, descripción en español, en minúscula, sin punto final:

```
feat(web): botón compartir en el encabezado

El texto sale de la descripción de la página para no pedirle a nadie que lo escriba.
```

| Tipo | Cuándo |
|---|---|
| `feat` | Algo nuevo que se usa: página, fuente, comando |
| `fix` | Algo que andaba mal |
| `docs` | Solo documentación o skills |
| `refactor` | Cambia el código sin cambiar lo que hace |
| `perf` | Más rápido o más liviano |
| `test` | Solo pruebas |
| `build` | Dependencias, Vite, Turborepo |
| `ci` | Workflows y hooks |
| `style` | Formato, no el diseño de la web |
| `chore` | Mantenimiento, datos, publicación |
| `revert` | Deshace un commit |

Ámbitos del referente, en `commitlint.config.mjs`: `web`, `panel`, `votacion`, `social`, `ui`, `core`, `scrapers`, `participation`, `data`, `docs`, `scripts`, `ci`, `skills`, `release`. Uno nuevo se agrega a esa lista y a esta tabla en el mismo commit. Si el cambio cruza todo el repo, el ámbito se omite.

Un contrato que se rompe (una columna de CSV publicada) lleva `!` y un pie:

```
feat(data)!: monto_total pasa a llamarse monto_pesos en compras

BREAKING CHANGE: la columna monto_total de data/processed/compras deja de existir; usar monto_pesos.
```

`subject-case` está apagado a propósito: la descripción puede empezar con un nombre propio. El cuerpo no tiene límite de ancho.

Quién lo controla, cuando los hooks existan: lefthook en `commit-msg` (`bunx commitlint --edit`) y el workflow del título del PR. Instalar con `bun run hooks`.

## Pull request

- Base `dev` para el trabajo de todos los días. Base `main` solo para un hotfix o para la publicación `dev → main`.
- Título igual al commit: `feat(web): …`. Con squash, ese título queda en `dev`.
- Cuerpo con cuatro partes: qué cambia y por qué; revisión del propio cambio (alcance, docs, idioma, secretos, datos, interfaz); cómo se verificó, con el comando y el resultado; riesgos.
- Lo que no aplica se tacha diciendo por qué. No se borra el ítem.
- Antes de abrirlo, mirar `git diff origin/dev...HEAD`. No escribir el cuerpo de memoria ni reutilizar el de otro PR.
- Un PR, una tarea. Lo que se pida después en la misma conversación sigue en la misma rama.

Merge a `dev`: squash, una persona del equipo, o el agente si le pidieron explícitamente mergear **ese** PR. Sin ese pedido, el PR queda abierto con la CI en verde y se pasa el link.

## Publicar

Cuando `dev` está probado:

```bash
git fetch origin
gh pr create --base main --head dev --title "chore(release): AAAA-MM-DD"
```

Se mergea con merge commit, no con squash ni rebase, para que `main` y `dev` compartan historia. En el referente el cuerpo lo arma `bun scripts/release-notes.ts --from origin/main --to origin/dev`, y un workflow crea un release de GitHub por día (no uno por publicación). No crear el release a mano.

Un commit que no debe disparar el build de Cloudflare lleva `[CF-Pages-Skip]` en el mensaje. El referente lo usa en el back merge y en las copias a archive.org.

## Qué no entra en un commit

- `.env`, `.env.local`, `.env.cloudflare`, `.env.posthog`, `.env.asistente`, `.env.archive-org`, ni ningún secreto.
- `node_modules/`, `.turbo/`, `dist/`, `apps/web/public/data/`, `apps/web/src/previews/`.
- Un `bun.lock` que cambió sin una dependencia nueva.
- Archivos de `data/raw/` editados o borrados. Ahí solo se agrega.

## Hasta dónde llega un agente

| Pedido | Límite |
|---|---|
| Nada sobre mergear | Rama, commits, push, PR a `dev`, CI verde, link |
| «Mergeá el #N» | Squash de ese PR a `dev` |
| «Publicalo en main» | Lo anterior, PR `dev → main`, merge commit, y confirmar el deploy |

El permiso vale para el PR que se nombró. Un merge a `dev` no autoriza el siguiente ni la publicación. Si falta un secreto o una decisión de una persona, el mensaje final dice qué falta y quién lo tiene. No cerrar con «espero a que termine la CI» si se puede seguir el chequeo hasta el resultado.
