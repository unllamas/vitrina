---
name: git-y-prs
description: Ramas, commits y pull requests de Vitrina (dev, Conventional Commits, squash, publicación a main, CI y hooks). Usar al crear una rama, commitear, pushear o abrir un PR. No mergear salvo un pedido explícito para ese PR.
---

# Git y pull requests

## Qué ya corre solo

- **CI** (`.github/workflows/ci.yml`): en cada push a `main` y `dev`, y en cada pull request. Job `verificar`, con Bun 1.4.2: `bun install --frozen-lockfile`, `bun run lint`, `bun run typecheck`, `bun test`, `bun run build`.
- **Hooks** (`lefthook.yml`), después de `bun run hooks` una vez por clon. Antes del commit, Biome formatea y lintea lo staged. En el mensaje, commitlint (`commitlint.config.mjs`).
- **Plantilla** de PR: `.github/pull_request_template.md`.

## Ramas

| Rama | Sale de | Entra a | Cómo se mergea |
|---|---|---|---|
| `feat/…`, `fix/…` | `dev` | PR a `dev` | Squash |
| `hotfix/…` | `main` | PR a `main`, y después a `dev` | Merge commit |
| `dev` | — | PR a `main` cuando se publica | Merge commit, no squash |
| `main` | — | — | Lo publicado |

Nombres en `kebab-case`, sin tildes. Ejemplo: `feat/pegar-link`.

```bash
git switch dev && git pull
bun run hooks
git switch -c feat/pegar-link
git fetch origin && git rebase origin/dev
git push -u origin HEAD
```

Después del rebase, si cambiaron `AGENTS.md` o `.cursor/skills/`, leerlos antes de seguir.

## Commits

```
feat(web): pantalla para pegar el link

La demo muestra un kit ficticio y no llama a Google.
```

Tipo y ámbito en inglés. Descripción en español, en minúscula, sin punto final. Si el cambio cruza todo el repo, el ámbito se omite.

| Tipo | Cuándo |
|---|---|
| `feat` | Una pantalla, un módulo del kit, un comando |
| `fix` | Algo que andaba mal |
| `docs` | Solo documentación o skills |
| `refactor` | Cambia el código sin cambiar lo que hace |
| `test` | Solo pruebas |
| `build` | Dependencias, Vite, Turborepo |
| `ci` | Workflows y hooks |
| `chore` | Mantenimiento o una publicación |

Ámbitos en `commitlint.config.mjs`: `web`, `ui`, `kit`, `docs`, `scripts`, `ci`, `skills`, `release`. Uno nuevo se agrega ahí y en esta lista en el mismo commit.

No usar `panel`, `votacion`, `scrapers`, `participation` ni `data`.

Un contrato que se rompe lleva `!` y un pie `BREAKING CHANGE:`.

## Pull request

- Base `dev`, salvo un hotfix o la publicación `dev → main`.
- Título igual al commit. Con squash, ese título queda en `dev`.
- Cuerpo de la plantilla: qué cambia y por qué, cómo se verificó (comando y resultado) y riesgos. Lo que no aplica se tacha, no se borra.
- Antes de abrirlo, mirar `git diff origin/dev...HEAD`.
- Una tarea, un PR. No mergear salvo pedido explícito para ese PR.

## Publicar

```bash
git fetch origin
gh pr create --base main --head dev --title "chore(release): AAAA-MM-DD"
```

Merge commit, para que `main` y `dev` compartan historia.

## Protección de ramas

Esta sesión no pudo activarla. `GET /repos/unllamas/vitrina/branches/main/protection` y `POST /repos/unllamas/vitrina/rulesets` responden `403 Resource not accessible by integration`. El token lee el repo y pushea código, y no administra reglas. Hay que cargarla en GitHub, en Settings → Rules → Rulesets, con dos rulesets activos.

Los dos comparten esto:

- Bypass: rol **Admin** del repositorio, modo always, para una emergencia.
- Restrict deletions.
- Block force pushes.
- Require a pull request before merging, con **0** aprobaciones (no hace falta review).
- Require status checks: el check `verificar`. Sin exigir que la rama esté al día.

Se diferencian en la rama y en el método de merge:

| Ruleset | Include | Allowed merge methods |
|---|---|---|
| `main` | `refs/heads/main` | solo `merge` |
| `dev` | `refs/heads/dev` | solo `squash` |

En Settings → General → Pull Requests tienen que seguir habilitados merge commit y squash. Rebase, desactivado: no es parte del flujo. Si el campo *Allowed merge methods* no aparece en el ruleset, GitHub no parte el método por rama: se dejan los dos habilitados y quien mergea elige squash hacia `dev` y merge commit hacia `main`.

## Qué no entra en un commit

- `.env`, `.env.local` y cualquier secreto.
- `node_modules/`, `.turbo/`, `dist/`.
- Un `bun.lock` que cambió sin una dependencia nueva.

## Hasta dónde llega un agente

| Pedido | Límite |
|---|---|
| Nada sobre mergear | Rama, commits, push, PR a `dev`, link |
| «Mergeá el #N» | Squash de ese PR a `dev` |
| «Publicalo en main» | Lo anterior, PR `dev → main` y merge commit |

El permiso vale para el PR que se nombró. Si falta una decisión, el mensaje final lo dice. No se elige en el código.
