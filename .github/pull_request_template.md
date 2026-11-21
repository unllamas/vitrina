<!--
Base `dev` para una tarea. Base `main` solo para una publicación (`dev` → `main`, merge commit) o un hotfix.
Título en Conventional Commits: `feat(web): …`. En un squash, ese título queda en `dev`.
Lo que no aplica se tacha (~~así~~), no se borra.
-->

## Qué cambia y por qué

## Cómo se verificó

- [ ] `bun run lint`
- [ ] `bun run typecheck`
- [ ] `bun test`
- [ ] `bun run build` si cambia la interfaz o el build

## Riesgos

<!-- Si no hay, tachar esta línea y decir por qué: ~~Sin riesgos revisados.~~ -->
