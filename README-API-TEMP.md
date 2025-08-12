# SetAi API - Temporary Setup Instructions

> **IMPORTANTE**: Este README temporal contiene las instrucciones completas para que la IA cree el proyecto API de SetAi desde cero usando NestJS + TypeScript. Este archivo debe ser usado como guía paso a paso y puede ser eliminado una vez que el proyecto API esté completamente configurado.

## 🎯 Objetivo del Proyecto API

Crear una API REST robusta que permita:
- Monitorear el estado del bot de Discord SetAi
- Aplicar cambios lógicos al bot (activar/desactivar comandos)
- Gestionar configuraciones del bot de forma remota
- Integrarse con una futura WebApp
- Proporcionar endpoints para administración y métricas

## 📋 Arquitectura del Ecosistema

```
┌─────────────┐    HTTP/REST    ┌─────────────┐    WebSocket/Redis    ┌─────────────┐
│   WebApp    │ ←───────────── │     API     │ ←──────────────────── │     Bot     │
│ (Frontend)  │                 │  (NestJS)   │                       │  (Discord)  │
└─────────────┘                 └─────────────┘                       └─────────────┘
```

## 🚀 Instrucciones de Configuración

### Paso 1: Crear el Proyecto NestJS

```bash
# Instalar NestJS CLI globalmente
npm install -g @nestjs/cli

# Crear nuevo proyecto
nest new setai-api

# Cambiar al directorio del proyecto
cd setai-api

# Configurar el gestor de paquetes a pnpm
echo 'package-manager=pnpm' > .npmrc
corepack enable
pnpm install
```

### Paso 2: Configuración de TypeScript y ESLint

Actualizar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "strict": true,
    "paths": {
      "@/*": ["src/*"],
      "@/common/*": ["src/common/*"],
      "@/modules/*": ["src/modules/*"],
      "@/config/*": ["src/config/*"]
    }
  }
}
```

### Paso 3: Estructura de Directorios

Crear la estructura de carpetas:
```bash
mkdir -p src/{modules,common,config,database,decorators,filters,guards,interceptors,pipes}
mkdir -p src/modules/{bot,health,auth}
mkdir -p test/{unit,integration,e2e}
mkdir -p docs/{api,setup,deployment}
```

### Paso 4: Configuración de Variables de Entorno

Crear `.env.example`:
```bash
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
JWT_SECRET=your-super-secret-jwt-key
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
```

### Paso 5: Dependencias del Proyecto

Actualizar `package.json` con las dependencias necesarias:
```bash
# Dependencias principales
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express
pnpm add @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport
pnpm add @nestjs/swagger @nestjs/throttler @nestjs/terminus
pnpm add typeorm pg redis ioredis
pnpm add passport passport-jwt passport-local
pnpm add bcryptjs joi class-validator class-transformer
pnpm add helmet compression morgan winston

# Dependencias de desarrollo
pnpm add -D @nestjs/cli @nestjs/schematics @nestjs/testing
pnpm add -D @types/express @types/jest @types/node @types/supertest
pnpm add -D @types/bcryptjs @types/passport-jwt @types/passport-local
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint eslint-config-prettier eslint-plugin-prettier
pnpm add -D jest ts-jest supertest prettier
pnpm add -D prisma @prisma/client
```

### Paso 6: Configuración de Jest

Actualizar `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

### Paso 7: Configuración de Base de Datos (Prisma)

Inicializar Prisma:
```bash
pnpm prisma init
```

Crear esquema en `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model BotStatus {
  id          String   @id @default(cuid())
  isOnline    Boolean  @default(false)
  lastSeen    DateTime?
  version     String?
  guildsCount Int?     @default(0)
  usersCount  Int?     @default(0)
  uptime      BigInt?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("bot_status")
}

model BotCommand {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isEnabled   Boolean  @default(true)
  category    String?
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("bot_commands")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Paso 8: Configuración Principal de NestJS

Crear `src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Performance
  app.use(compression());
  
  // Logging
  app.use(morgan('combined'));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SetAi API')
    .setDescription('API para gestión y monitoreo del bot SetAi')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación')
    .addTag('bot', 'Gestión del Bot')
    .addTag('health', 'Estado de la API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 SetAi API ejecutándose en: http://localhost:${port}`);
  console.log(`📖 Documentación disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### Paso 9: Módulo Principal

Crear `src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotModule } from './modules/bot/bot.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    PrismaModule,
    AuthModule,
    BotModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Paso 10: Configuración de la Base de Datos

Crear `src/database/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Crear `src/database/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Paso 11: Módulo de Autenticación

Crear estructura de autenticación:
```bash
# Generar módulo de auth
nest generate module modules/auth
nest generate service modules/auth
nest generate controller modules/auth
```

### Paso 12: Módulo del Bot

Crear `src/modules/bot/bot.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';

@Module({
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
```

### Paso 13: Scripts de Package.json

Actualizar scripts en `package.json`:
```json
{
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
```

### Paso 14: Configuración de CI/CD

Crear `.github/workflows/ci.yml`:
```yaml
name: CI - SetAi API

on:
  push:
    branches: [main, develop, 'feature/*']
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: setai_api_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Setup database
        run: |
          pnpm prisma generate
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/setai_api_test

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/setai_api_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

### Paso 15: Configuración de Docker

Crear `Dockerfile`:
```dockerfile
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
```

### Paso 16: Docker Compose para Desarrollo

Crear `docker-compose.yml`:
```yaml
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
```

### Paso 17: Configuración de Linting y Formatting

Crear `.eslintrc.js`:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@nestjs/eslint-config-nestjs',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'prettier/prettier': 'error',
  },
};
```

Crear `.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Paso 18: Documentación del Proyecto

Crear `docs/api/README.md`:
```markdown
# SetAi API Documentation

## Endpoints Principales

### Authentication
- `POST /api/v1/auth/login` - Login de usuario
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Bot Management
- `GET /api/v1/bot/status` - Estado actual del bot
- `PUT /api/v1/bot/commands/:id/toggle` - Activar/desactivar comando
- `GET /api/v1/bot/commands` - Listar comandos disponibles
- `GET /api/v1/bot/metrics` - Métricas de uso del bot

### Health
- `GET /health` - Health check de la API
- `GET /health/detailed` - Health check detallado
```

### Paso 19: Contributing Guidelines

Crear `CONTRIBUTING.md`:
```markdown
# Contribuir a SetAi API

## Flujo de Trabajo (GitLab Flow)

### Ramas Principales
- `main` — Código de producción (releases)
- `develop` — Rama de desarrollo e integración
- `feature/*` — Nuevas funcionalidades
- `hotfix/*` — Correcciones críticas

### Proceso de Desarrollo

1. **Crear una rama desde develop:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollo:**
   - Escribir código siguiendo las convenciones
   - Escribir tests (cobertura mínima 70%)
   - Ejecutar linting: `pnpm lint`
   - Ejecutar tests: `pnpm test:cov`

3. **Commit:**
   ```bash
   git add .
   git commit -m "feat: descripción de la funcionalidad"
   ```

4. **Push y PR:**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
   Abrir PR hacia `develop`

### Convenciones de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### Estándares de Código

- **TypeScript:** Tipado fuerte, no usar `any`
- **NestJS:** Seguir arquitectura modular
- **Tests:** Cobertura mínima del 70%
- **Documentación:** APIs documentadas con Swagger
- **Seguridad:** Validación de entrada, autenticación JWT

### Revisión de Código

Todo PR debe:
- Pasar los tests de CI
- Tener cobertura de código suficiente
- Ser revisado por al menos un maintainer
- Seguir las convenciones establecidas
```

### Paso 20: Code of Conduct

Crear `CODE_OF_CONDUCT.md`:
```markdown
# Código de Conducta

## Nuestro Compromiso

Nos comprometemos a hacer de la participación en este proyecto una experiencia libre de acoso para todos, independientemente de edad, tamaño corporal, discapacidad visible o invisible, etnia, características sexuales, identidad y expresión de género, nivel de experiencia, educación, estatus socio-económico, nacionalidad, apariencia personal, raza, religión, o identidad y orientación sexual.

## Nuestros Estándares

### Comportamientos que contribuyen a crear un ambiente positivo:
- Uso de lenguaje acogedor e inclusivo
- Respeto a diferentes puntos de vista y experiencias
- Aceptación constructiva de críticas
- Enfoque en lo que es mejor para la comunidad
- Empatía hacia otros miembros de la comunidad

### Comportamientos inaceptables:
- Uso de lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes/despectivos, y ataques personales o políticos
- Acoso público o privado
- Publicar información privada de otros sin permiso explícito
- Otras conductas que podrían ser consideradas inapropiadas en un entorno profesional

## Aplicación

Los casos de comportamiento abusivo, acosador o inaceptable pueden ser reportados contactando al equipo del proyecto en [email]. Todas las quejas serán revisadas e investigadas y resultarán en una respuesta que se considere necesaria y apropiada a las circunstancias.

## Atribución

Este Código de Conducta es una adaptación del [Contributor Covenant][homepage], versión 2.0.
```

### Paso 21: Security Policy

Crear `SECURITY.md`:
```markdown
# Política de Seguridad

## Versiones Soportadas

| Versión | Soporte de Seguridad |
| ------- | -------------------- |
| 1.x.x   | ✅                   |
| < 1.0   | ❌                   |

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor NO la publiques en un issue público.

### Proceso de Reporte

1. **Envía un email a:** security@setai.dev
2. **Incluye:**
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Versión afectada
   - Impacto potencial

3. **Respuesta esperada:**
   - Confirmación de recepción: 24 horas
   - Evaluación inicial: 72 horas
   - Resolución: según severidad

### Proceso de Divulgación

- Trabajaremos contigo para entender y resolver el problema
- Te acreditaremos en el fix (si lo deseas)
- Coordinaremos la divulgación pública después del fix

## Mejores Prácticas de Seguridad

- Usar variables de entorno para secretos
- Implementar rate limiting
- Validar todas las entradas
- Usar HTTPS en producción
- Mantener dependencias actualizadas
```

### Paso 22: Comandos de Inicialización Rápida

Para que la IA pueda ejecutar todo de una vez, crear un script `setup.sh`:

```bash
#!/bin/bash

echo "🚀 Configurando SetAi API..."

# Crear proyecto
nest new setai-api --package-manager pnpm
cd setai-api

# Configurar pnpm
echo 'package-manager=pnpm' > .npmrc

# Instalar dependencias
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/throttler @nestjs/terminus typeorm pg redis ioredis passport passport-jwt passport-local bcryptjs joi class-validator class-transformer helmet compression morgan winston

pnpm add -D @nestjs/cli @nestjs/schematics @nestjs/testing @types/express @types/jest @types/node @types/supertest @types/bcryptjs @types/passport-jwt @types/passport-local @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier jest ts-jest supertest prettier prisma @prisma/client

# Configurar Prisma
pnpm prisma init

# Crear estructura de directorios
mkdir -p src/{modules,common,config,database,decorators,filters,guards,interceptors,pipes}
mkdir -p src/modules/{bot,health,auth}
mkdir -p test/{unit,integration,e2e}
mkdir -p docs/{api,setup,deployment}

echo "✅ SetAi API configurado exitosamente!"
echo "📝 Siguiente paso: configurar variables de entorno en .env"
echo "🔧 Después ejecutar: pnpm prisma migrate dev"
```

## 📖 Comandos Esenciales Post-Setup

```bash
# Desarrollo
pnpm start:dev          # Iniciar en modo desarrollo
pnpm test:watch         # Tests en modo watch
pnpm prisma:studio      # Interfaz visual de la DB

# Producción
pnpm build              # Construir para producción
pnpm start:prod         # Iniciar en producción

# Base de datos
pnpm prisma:migrate     # Aplicar migraciones
pnpm prisma:generate    # Generar cliente Prisma
pnpm db:reset           # Resetear base de datos

# Docker
docker-compose up -d    # Levantar servicios en desarrollo
docker build -t setai-api . # Construir imagen
```

## 🔗 Integración con el Bot

### Comunicación via Redis

```typescript
// src/services/bot-communication.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class BotCommunicationService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  async sendCommandToBot(command: string, data: any) {
    await this.redis.publish('bot:commands', JSON.stringify({ command, data }));
  }

  async getBotStatus() {
    return await this.redis.get('bot:status');
  }
}
```

### Endpoints de Integración

```typescript
// Ejemplo de endpoint para activar/desactivar comandos
@Put('commands/:commandId/toggle')
async toggleCommand(@Param('commandId') commandId: string) {
  const command = await this.botService.toggleCommand(commandId);
  await this.botCommunicationService.sendCommandToBot('toggle_command', {
    commandId,
    enabled: command.isEnabled,
  });
  return command;
}
```

## 🎯 Checklist de Finalización

- [ ] ✅ Proyecto NestJS creado y configurado
- [ ] ✅ Base de datos PostgreSQL configurada con Prisma
- [ ] ✅ Redis configurado para comunicación con el bot
- [ ] ✅ Autenticación JWT implementada
- [ ] ✅ Swagger documentación configurada
- [ ] ✅ Tests con Jest y cobertura >70%
- [ ] ✅ CI/CD con GitHub Actions
- [ ] ✅ Docker y Docker Compose configurados
- [ ] ✅ ESLint y Prettier configurados
- [ ] ✅ Documentación completa (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- [ ] ✅ GitLab Flow implementado (main ← develop ← feature/*)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Health checks implementados
- [ ] ✅ Rate limiting configurado
- [ ] ✅ Logging configurado
- [ ] ✅ Validación de entrada configurada
- [ ] ✅ Endpoints básicos del bot implementados

## 📞 Próximos Pasos

1. **Ejecutar el setup inicial** usando los comandos proporcionados
2. **Configurar variables de entorno** según `.env.example`
3. **Ejecutar migraciones** de la base de datos
4. **Implementar endpoints específicos** según necesidades del bot
5. **Configurar integración continua** en el repositorio
6. **Desplegar en producción** usando Docker
7. **Conectar con el bot** via Redis

---

> **Nota**: Este README temporal debe ser reemplazado por la documentación definitiva del proyecto una vez completado el setup inicial.