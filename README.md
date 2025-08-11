# Setai (Bot)

> Setai es un bot de Discord autónomo impulsado por IA con el que podrás configurar tu servidor de Discord fácil y rápido.

## Arquitectura
- Bot (este repo) → API ← WebApp
- Este repositorio contiene únicamente el bot (Node.js 22.18 LTS) y usa pnpm como gestor de paquetes.

## Features
- Comunicarte con lenguaje natural.
- Leer, crear y editar canales, roles, categorías y más.
- Compatible con cualquier API/Modelo (o vía OpenAI SDK).
- Se adapta al estilo y configuración que definas.
- API y WebApp públicos (planificados).
- Más por llegar.

## Prerrequisitos
- Node.js 22.x (LTS). Recomendado: usar Docker o nvm.
- pnpm (vía corepack):
	- corepack enable
	- pnpm -v

## Desarrollo local (pnpm)
- Instalar dependencias: pnpm install
- Variables de entorno: crea un archivo .env con al menos:
	- DISCORD_TOKEN=...
	- REDIS_URL=redis://localhost:6379 (o tu instancia)
- Ejecutar en dev: pnpm run dev
- Ejecutar en prod: pnpm start
- Tests: pnpm test

## Docker
- Imagen base recomendada: node:22-alpine
- Pasos de referencia (en tu host):
	- docker pull node:22-alpine
	- docker run -it --rm --entrypoint sh node:22-alpine
	- node -v  # debería mostrar v22.x
	- corepack enable pnpm && pnpm -v
- Build local de la imagen del bot (desde la raíz del repo):
	- docker build -t setai-bot:dev .
	- docker run --rm -e DISCORD_TOKEN=... -e REDIS_URL=redis://redis:6379 setai-bot:dev
- Nota: El workflow de GitHub Actions incluye un pipeline de Docker comentado; descoméntalo cuando tengas los secretos y la imagen definidos.

## Monorepo y servicios
- Bot: https://github.com/Rext-dev/SetAi-bot (este repo)
- API: (próximamente)
- WebApp: (próximamente)

## Comunidad
- Próximamente

## Contribuir
- Lee CONTRIBUTING.md para flujo de ramas, PRs y convenciones de commits.
- Usa Conventional Commits (feat, fix, chore, docs, etc.).

## Licencia
- Open Source. Propuesta: MIT para maximizar adopción y contribuciones.
