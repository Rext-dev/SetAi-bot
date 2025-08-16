###############################################
# Imagen multi-stage optimizada (Node 22 + pnpm)
# Objetivos:
#  - Cache estable de dependencias usando lockfile
#  - Copiar sólo el código necesario (bot/src y tsconfig)
#  - Prune para prod en la capa final
#  - Ejecutar como usuario no root
#  - Etiquetas útiles para trazabilidad
###############################################

ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app
RUN corepack enable

###############################################
# deps (instala TODAS las dependencias para compilar TS)
###############################################
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

###############################################
# build (compila y hace prune a prod)
###############################################
FROM deps AS build
COPY tsconfig.json ./
# Copiamos sólo el código fuente necesario (evita arrastrar tests/coverage)
COPY bot/src ./bot/src
RUN pnpm run build
# Prune deja sólo deps de producción (node_modules queda reducido)
RUN pnpm prune --prod

###############################################
# runtime (imagen final mínima)
###############################################
FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Labels OCI (personaliza si quieres)
ARG GIT_SHA="dev"
LABEL org.opencontainers.image.source="https://github.com/rext-dev/SetAi-bot" \
	org.opencontainers.image.revision="$GIT_SHA" \
	org.opencontainers.image.title="SetAi Bot" \
	org.opencontainers.image.description="Bot de Discord autónomo impulsado por IA" \
	org.opencontainers.image.licenses="MIT"

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

USER node

CMD ["node", "dist/index.js"]
