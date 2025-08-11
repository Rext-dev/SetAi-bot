# Imagen multi-stage optimizada para Node 22 LTS y pnpm
## Fase 1: deps (instalación de dependencias en producción)
FROM node:22-alpine AS deps
WORKDIR /app

# Habilita pnpm a través de corepack
RUN corepack enable

# Copia manifiestos para cachear instalación
COPY package.json pnpm-lock.yaml ./

# Instala dependencias de producción usando el lockfile
RUN pnpm install --frozen-lockfile

# Copia el código del bot
COPY bot/ ./bot/

# Compila TypeScript a dist/
RUN pnpm run build

# Deja solo dependencias de producción
RUN pnpm prune --prod


## Fase 2: runtime (imagen final mínima)
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copia solo lo necesario desde la fase anterior
# Asegura propiedad por el usuario 'node' para evitar problemas de permisos
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=deps /app/dist ./dist

# Ejecutar como usuario no root
USER node

# Variables de entorno comunes (ajusta según tu proyecto)
# ENV DISCORD_TOKEN=""
# ENV REDIS_URL="redis://redis:6379"

# Punto de entrada del bot
# Asegúrate de que el archivo exista o ajusta la ruta
CMD ["node", "dist/index.js"]
