# Contribuir a este proyecto

¡Gracias por querer contribuir! Sigue estos pasos para que tu PR sea revisado rápido y sin problemas.

## Flujo de trabajo (branches)
Usamos la siguiente convención de ramas:

- `main` — Código de producción (releases). No se hace push directo.
- `develop` — Integración diaria, antes de preparar releases.
- `feature/<descripcion>` — Nuevas funcionalidades.
- `fix/<descripcion>` o `bugfix/<descripcion>` — Correcciones menores.
- `hotfix/<descripcion>` — Correcciones críticas para `main`.
- `release/<version>` — Ramas de preparación de release.

Nombres de ramas: usa `feature/mi-nueva-funcionalidad` (guiones `-`, minúsculas).
Las ramas deben cumplir: `feature/* | fix/* | hotfix/* | release/* | chore/* | bugfix/*`.

## Antes de abrir PR
- Actualiza tu rama desde `develop` (o `main` según el caso).
- Ejecuta las pruebas y coverage: `npm ci`, `npm test`, `npm run coverage`
  - Valida que el coverage sea al menos del 70%.
- Lint y formatea: `npm run lint` / `npm run format`.
- Asegúrate de que tu PR tenga un solo propósito (una issue por PR) y que pase CI.

## Pull Request
- Abre PR hacia `develop` (o `main` si es hotfix/release).
- Describe el cambio, link a issues relacionados, pasos para probar.
- Asigna reviewers y añade `Closes #N` si corresponde.

## Commits
- Sigue Conventional Commits: `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`.

## Seguridad
Si encuentras una vulnerabilidad, no la publiques en un issue público. Revisa `SECURITY.md` para el proceso de reporte responsable.

## Notas
- Este repositorio está iniciándose; algunas tareas (lint, tests, build, Docker) pueden no estar configuradas todavía. Deja comentarios o TODOs claros en tu PR si necesitas habilitarlas.
