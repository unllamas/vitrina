---
name: git-y-prs
description: Ramas, commits y pull requests de Vitrina (dev, Conventional Commits, squash, publicación a main). Usar al crear una rama, commitear, pushear o abrir un PR. No mergear salvo un pedido explícito para ese PR.
---

# Git y pull requests

## Estado del repo

`main` tiene la demo y `dev` apunta al mismo commit para que el trabajo nuevo salga de ahí. No hay plantilla de PR ni hooks de git. El código no se pushea directo a `main`, salvo un pedido explícito de publicarlo ahí.

## Ramas

| Rama | Sale de | Entra a | Para qué |
|---|---|---|---|
| `feat/…`, `fix/…` | `dev` | PR a `dev` | Una tarea. Ejemplo: `feat/pegar-link` |
| `hotfix/…` | `main` | PR a `main`, y después a `dev` | Algo roto en producción que no puede esperar |
| `dev` | — | PR a `main` cuando se publica | Integración |
| `main` | — | — | Lo que se considera publicado |

Nombres en `kebab-case`, sin tildes.

```bash
git switch dev && git pull
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

Tipo y ámbito en inglés. Descripción en español, en minúscula, sin punto final.

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

Ámbitos: `web`, `ui`, `kit`, `docs`, `scripts`, `ci`, `skills`, `release`. Uno nuevo se agrega a `commitlint.config.mjs` y a esta lista en el mismo commit. Si el cambio cruza todo el repo, el ámbito se omite.

No usar los ámbitos `panel`, `votacion`, `scrapers`, `participation` ni `data`. No son de este producto.

Un contrato que se rompe (el costo de un kit, los campos de `MarketingKit` que otra pantalla ya lee) lleva `!` y un pie `BREAKING CHANGE:`.

## Pull request

- Base `dev`, salvo un hotfix o la publicación `dev → main`.
- Título igual al commit. Con squash, ese título queda en `dev`.
- Cuerpo: qué cambia y por qué, cómo se verificó (comando y resultado) y riesgos. Lo que no aplica se tacha, no se borra.
- Antes de abrirlo, mirar `git diff origin/dev...HEAD`.
- Una tarea, un PR.

Merge a `dev` con squash, y solo si una persona lo pide para ese PR. Sin ese pedido, el PR queda abierto y se pasa el link.

## Publicar

```bash
git fetch origin
gh pr create --base main --head dev --title "chore(release): AAAA-MM-DD"
```

Merge commit, no squash, para que `main` y `dev` compartan historia. No hace falta el release diario del referente.

## Qué no entra en un commit

- `.env`, `.env.local` y cualquier secreto (Places, IA, Mercado Pago).
- `node_modules/`, `.turbo/`, `dist/`.
- Un `bun.lock` que cambió sin una dependencia nueva.

## Hasta dónde llega un agente

| Pedido | Límite |
|---|---|
| Nada sobre mergear | Rama, commits, push, PR a `dev`, link |
| «Mergeá el #N» | Squash de ese PR a `dev` |
| «Publicalo en main» | Lo anterior, PR `dev → main` y merge commit |

El permiso vale para el PR que se nombró. Si falta una decisión (la marca de la chrome, el proveedor de IA, dónde se guardan los créditos), el mensaje final lo dice. No se elige en el código.