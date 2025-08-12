#!/bin/bash

# SetAi API - Setup Rápido
# Este script automatiza la configuración inicial del proyecto API

set -e  # Salir si hay algún error

echo "🚀 Iniciando configuración de SetAi API..."
echo "📋 Este script creará un proyecto NestJS completo con todas las dependencias"
echo ""

# Verificar si NestJS CLI está instalado
if ! command -v nest &> /dev/null; then
    echo "📦 Instalando NestJS CLI..."
    npm install -g @nestjs/cli
fi

# Verificar si pnpm está disponible
if ! command -v pnpm &> /dev/null; then
    echo "🔧 Habilitando pnpm..."
    corepack enable
fi

# Crear el directorio del proyecto
PROJECT_NAME="${1:-setai-api}"
echo "📁 Creando proyecto: $PROJECT_NAME"

# Crear proyecto NestJS
nest new $PROJECT_NAME --package-manager pnpm --skip-git

cd $PROJECT_NAME

echo "⚙️ Configurando estructura del proyecto..."

# Configurar .npmrc para usar pnpm
echo 'package-manager=pnpm' > .npmrc

# Crear estructura de directorios
mkdir -p src/{modules,common,config,database,decorators,filters,guards,interceptors,pipes}
mkdir -p src/modules/{bot,health,auth}
mkdir -p test/{unit,integration,e2e}
mkdir -p docs/{api,setup,deployment}

echo "📦 Instalando dependencias principales..."

# Dependencias principales
pnpm add @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport
pnpm add @nestjs/swagger @nestjs/throttler @nestjs/terminus
pnpm add typeorm pg redis ioredis
pnpm add passport passport-jwt passport-local
pnpm add bcryptjs joi class-validator class-transformer
pnpm add helmet compression morgan winston

echo "🛠️ Instalando dependencias de desarrollo..."

# Dependencias de desarrollo
pnpm add -D @nestjs/schematics @nestjs/testing
pnpm add -D @types/express @types/jest @types/node @types/supertest
pnpm add -D @types/bcryptjs @types/passport-jwt @types/passport-local
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint eslint-config-prettier eslint-plugin-prettier
pnpm add -D jest ts-jest supertest prettier
pnpm add -D prisma @prisma/client

echo "🗄️ Configurando Prisma..."
pnpm prisma init

echo "📄 Creando archivos de configuración..."

# Crear .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/setai_api"
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=setai_api

# Redis (for bot communication)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Bot Communication
BOT_API_KEY=your-bot-api-key
BOT_WEBHOOK_SECRET=your-webhook-secret

# Server
PORT=3000
NODE_ENV=development

# Monitoring
SENTRY_DSN=
LOG_LEVEL=debug
EOF

# Crear .env desde .env.example
cp .env.example .env

# Actualizar package.json scripts
cat > package.json << 'EOF'
{
  "name": "setai-api",
  "version": "1.0.0",
  "description": "API REST para gestión y monitoreo del bot SetAi",
  "author": "Rext-dev",
  "private": true,
  "license": "MIT",
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:push": "prisma db push"
  }
}
EOF

# Reinstalar dependencias con el nuevo package.json
pnpm install

echo "🐳 Creando configuración de Docker..."

# Crear Dockerfile
cat > Dockerfile << 'EOF'
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm prisma generate
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]
EOF

# Crear docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/setai_api
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: setai_api
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  adminer:
    image: adminer
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
EOF

echo "⚡ Generando módulos NestJS..."

# Generar módulos básicos
nest generate module modules/auth --no-spec
nest generate service modules/auth --no-spec  
nest generate controller modules/auth --no-spec

nest generate module modules/bot --no-spec
nest generate service modules/bot --no-spec
nest generate controller modules/bot --no-spec

nest generate module modules/health --no-spec
nest generate service modules/health --no-spec
nest generate controller modules/health --no-spec

echo "🔧 Configurando Prisma..."
pnpm prisma generate

echo "✅ ¡Configuración completada!"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. cd $PROJECT_NAME"
echo "   2. Configurar variables en .env"
echo "   3. pnpm prisma migrate dev"
echo "   4. pnpm start:dev"
echo ""
echo "📖 URLs importantes:"
echo "   - API: http://localhost:3000"
echo "   - Swagger: http://localhost:3000/api/docs"
echo "   - Adminer: http://localhost:8080"
echo ""
echo "🐳 Para usar Docker:"
echo "   docker-compose up -d"
echo ""