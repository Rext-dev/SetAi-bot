# Guía de Integración API ↔ Bot

> **Este documento detalla cómo integrar la API de SetAi con el bot de Discord existente**

## 🔗 Arquitectura de Comunicación

```
┌─────────────────┐    Redis PubSub    ┌─────────────────┐
│   SetAi API     │ ←─────────────────→ │   SetAi Bot     │
│   (NestJS)      │                     │   (Discord.js)  │
└─────────────────┘                     └─────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   PostgreSQL    │                     │     Redis       │
│   (Persistencia)│                     │   (Estado)      │
└─────────────────┘                     └─────────────────┘
```

## 📡 Canales de Comunicación Redis

### Canales del Bot → API
- `bot:status` - Estado general del bot
- `bot:heartbeat` - Heartbeat cada 30 segundos
- `bot:command:executed` - Comando ejecutado
- `bot:guild:joined` - Bot añadido a servidor
- `bot:guild:left` - Bot removido de servidor
- `bot:error` - Errores del bot

### Canales de API → Bot
- `api:command:toggle` - Activar/desactivar comando
- `api:config:update` - Actualizar configuración
- `api:bot:restart` - Reiniciar bot
- `api:bot:shutdown` - Apagar bot

## 🛠️ Implementación en el Bot (Discord.js)

### 1. Servicio de Comunicación con API

Crear `bot/src/services/api-communication.ts`:

```typescript
import Redis from 'ioredis';
import { getClient } from './client';

export class ApiCommunication {
  private redis: Redis;
  private publisher: Redis;
  private subscriber: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
    
    this.publisher = this.redis.duplicate();
    this.subscriber = this.redis.duplicate();
    
    this.setupSubscriptions();
    this.startHeartbeat();
  }

  private setupSubscriptions() {
    this.subscriber.subscribe('api:command:toggle', 'api:config:update', 'api:bot:restart', 'api:bot:shutdown');
    
    this.subscriber.on('message', async (channel, message) => {
      try {
        const data = JSON.parse(message);
        await this.handleApiMessage(channel, data);
      } catch (error) {
        console.error('Error processing API message:', error);
      }
    });
  }

  private async handleApiMessage(channel: string, data: any) {
    switch (channel) {
      case 'api:command:toggle':
        await this.toggleCommand(data.commandName, data.enabled);
        break;
      case 'api:config:update':
        await this.updateConfig(data.config);
        break;
      case 'api:bot:restart':
        await this.restartBot();
        break;
      case 'api:bot:shutdown':
        await this.shutdownBot();
        break;
    }
  }

  async publishBotStatus() {
    const client = getClient();
    const status = {
      isOnline: client.isReady(),
      uptime: client.uptime,
      guildsCount: client.guilds.cache.size,
      usersCount: client.users.cache.size,
      ping: client.ws.ping,
      timestamp: new Date().toISOString(),
    };

    await this.publisher.publish('bot:status', JSON.stringify(status));
    await this.redis.setex('bot:current_status', 60, JSON.stringify(status));
  }

  async publishCommandExecution(commandName: string, userId: string, guildId: string) {
    const data = {
      commandName,
      userId,
      guildId,
      timestamp: new Date().toISOString(),
    };

    await this.publisher.publish('bot:command:executed', JSON.stringify(data));
  }

  async publishError(error: Error, context?: string) {
    const data = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    await this.publisher.publish('bot:error', JSON.stringify(data));
  }

  private startHeartbeat() {
    setInterval(async () => {
      await this.publishBotStatus();
    }, 30000); // Cada 30 segundos
  }

  private async toggleCommand(commandName: string, enabled: boolean) {
    // Implementar lógica para activar/desactivar comando
    console.log(`Comando ${commandName} ${enabled ? 'activado' : 'desactivado'}`);
  }

  private async updateConfig(config: any) {
    // Implementar actualización de configuración
    console.log('Configuración actualizada:', config);
  }

  private async restartBot() {
    console.log('Reiniciando bot...');
    process.exit(0); // PM2 o supervisor se encargará del reinicio
  }

  private async shutdownBot() {
    console.log('Apagando bot...');
    const client = getClient();
    await client.destroy();
    process.exit(0);
  }
}

export const apiCommunication = new ApiCommunication();
```

### 2. Integrar en el Bot Principal

Actualizar `bot/src/index.ts`:

```typescript
import { getClient } from './services/client';
import { apiCommunication } from './services/api-communication';

async function main() {
  try {
    const client = getClient();
    
    client.once('ready', () => {
      console.log(`✅ Bot conectado como ${client.user?.tag}`);
      // Publicar estado inicial
      apiCommunication.publishBotStatus();
    });

    // Escuchar comandos para reportar uso
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;
      
      await apiCommunication.publishCommandExecution(
        interaction.commandName,
        interaction.user.id,
        interaction.guildId || 'DM'
      );
    });

    // Reportar cuando se une a un servidor
    client.on('guildCreate', async (guild) => {
      await apiCommunication.publisher.publish('bot:guild:joined', JSON.stringify({
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.memberCount,
        timestamp: new Date().toISOString(),
      }));
    });

    // Reportar cuando sale de un servidor
    client.on('guildDelete', async (guild) => {
      await apiCommunication.publisher.publish('bot:guild:left', JSON.stringify({
        guildId: guild.id,
        guildName: guild.name,
        timestamp: new Date().toISOString(),
      }));
    });

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Error iniciando el bot:', error);
    await apiCommunication.publishError(error as Error, 'startup');
  }
}

main();
```

## 🎯 Implementación en la API (NestJS)

### 1. Servicio de Comunicación con Bot

Crear `src/modules/bot/bot-communication.service.ts`:

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BotCommunicationService implements OnModuleInit {
  private readonly logger = new Logger(BotCommunicationService.name);
  private redis: Redis;
  private publisher: Redis;
  private subscriber: Redis;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
    });
    
    this.publisher = this.redis.duplicate();
    this.subscriber = this.redis.duplicate();
  }

  async onModuleInit() {
    await this.setupBotSubscriptions();
  }

  private async setupBotSubscriptions() {
    await this.subscriber.subscribe(
      'bot:status',
      'bot:heartbeat', 
      'bot:command:executed',
      'bot:guild:joined',
      'bot:guild:left',
      'bot:error'
    );

    this.subscriber.on('message', async (channel, message) => {
      try {
        const data = JSON.parse(message);
        await this.handleBotMessage(channel, data);
      } catch (error) {
        this.logger.error(`Error processing bot message: ${error.message}`);
      }
    });
  }

  private async handleBotMessage(channel: string, data: any) {
    switch (channel) {
      case 'bot:status':
        await this.updateBotStatus(data);
        break;
      case 'bot:command:executed':
        await this.recordCommandExecution(data);
        break;
      case 'bot:guild:joined':
        await this.recordGuildJoin(data);
        break;
      case 'bot:guild:left':
        await this.recordGuildLeave(data);
        break;
      case 'bot:error':
        await this.recordBotError(data);
        break;
    }
  }

  async getCurrentBotStatus() {
    const status = await this.redis.get('bot:current_status');
    return status ? JSON.parse(status) : null;
  }

  async toggleCommand(commandName: string, enabled: boolean) {
    // Actualizar en base de datos
    await this.prisma.botCommand.upsert({
      where: { name: commandName },
      update: { isEnabled: enabled },
      create: {
        name: commandName,
        isEnabled: enabled,
        description: `Command ${commandName}`,
      },
    });

    // Enviar comando al bot
    await this.publisher.publish('api:command:toggle', JSON.stringify({
      commandName,
      enabled,
    }));

    return { commandName, enabled };
  }

  async updateBotConfig(config: any) {
    await this.publisher.publish('api:config:update', JSON.stringify({
      config,
    }));
  }

  async restartBot() {
    await this.publisher.publish('api:bot:restart', JSON.stringify({}));
  }

  async shutdownBot() {
    await this.publisher.publish('api:bot:shutdown', JSON.stringify({}));
  }

  private async updateBotStatus(data: any) {
    await this.prisma.botStatus.upsert({
      where: { id: 'current' },
      update: {
        isOnline: data.isOnline,
        lastSeen: new Date(),
        guildsCount: data.guildsCount,
        usersCount: data.usersCount,
        uptime: BigInt(data.uptime || 0),
      },
      create: {
        id: 'current',
        isOnline: data.isOnline,
        lastSeen: new Date(),
        guildsCount: data.guildsCount,
        usersCount: data.usersCount,
        uptime: BigInt(data.uptime || 0),
      },
    });
  }

  private async recordCommandExecution(data: any) {
    await this.prisma.botCommand.upsert({
      where: { name: data.commandName },
      update: {
        usageCount: { increment: 1 },
      },
      create: {
        name: data.commandName,
        description: `Command ${data.commandName}`,
        usageCount: 1,
      },
    });
  }

  private async recordGuildJoin(data: any) {
    this.logger.log(`Bot joined guild: ${data.guildName} (${data.guildId})`);
  }

  private async recordGuildLeave(data: any) {
    this.logger.log(`Bot left guild: ${data.guildName} (${data.guildId})`);
  }

  private async recordBotError(data: any) {
    this.logger.error(`Bot error: ${data.message}`, data.stack);
  }
}
```

### 2. Controlador de Bot

Actualizar `src/modules/bot/bot.controller.ts`:

```typescript
import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BotService } from './bot.service';
import { BotCommunicationService } from './bot-communication.service';

@ApiTags('bot')
@Controller('bot')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly botCommunication: BotCommunicationService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado actual del bot' })
  @ApiResponse({ status: 200, description: 'Estado del bot obtenido exitosamente' })
  async getBotStatus() {
    return await this.botCommunication.getCurrentBotStatus();
  }

  @Get('commands')
  @ApiOperation({ summary: 'Listar todos los comandos del bot' })
  async getCommands() {
    return await this.botService.getCommands();
  }

  @Put('commands/:name/toggle')
  @ApiOperation({ summary: 'Activar o desactivar un comando' })
  async toggleCommand(
    @Param('name') name: string,
    @Body() body: { enabled: boolean },
  ) {
    return await this.botCommunication.toggleCommand(name, body.enabled);
  }

  @Post('restart')
  @ApiOperation({ summary: 'Reiniciar el bot' })
  async restartBot() {
    await this.botCommunication.restartBot();
    return { message: 'Comando de reinicio enviado al bot' };
  }

  @Post('shutdown')
  @ApiOperation({ summary: 'Apagar el bot' })
  async shutdownBot() {
    await this.botCommunication.shutdownBot();
    return { message: 'Comando de apagado enviado al bot' };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas del bot' })
  async getBotMetrics() {
    return await this.botService.getMetrics();
  }
}
```

## 🔧 Variables de Entorno Necesarias

### En el Bot (.env)
```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Discord
DISCORD_TOKEN=your_discord_token

# API
API_BASE_URL=http://localhost:3000
API_KEY=your_api_key
```

### En la API (.env)
```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Bot
BOT_API_KEY=your_bot_api_key
BOT_WEBHOOK_SECRET=your_webhook_secret
```

## 🧪 Testing de la Integración

### Test del Bot
```typescript
// bot/test/api-communication.test.ts
import { ApiCommunication } from '../src/services/api-communication';

describe('ApiCommunication', () => {
  let apiComm: ApiCommunication;

  beforeEach(() => {
    apiComm = new ApiCommunication();
  });

  it('should publish bot status', async () => {
    await expect(apiComm.publishBotStatus()).resolves.not.toThrow();
  });

  it('should handle command toggle', async () => {
    // Test command toggle functionality
  });
});
```

### Test de la API
```typescript
// src/modules/bot/bot-communication.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BotCommunicationService } from './bot-communication.service';

describe('BotCommunicationService', () => {
  let service: BotCommunicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotCommunicationService],
    }).compile();

    service = module.get<BotCommunicationService>(BotCommunicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should toggle command', async () => {
    const result = await service.toggleCommand('test', true);
    expect(result.enabled).toBe(true);
  });
});
```

## 📊 Monitoreo y Métricas

### Dashboard de Estado
La API debe proporcionar endpoints para:
- Estado en tiempo real del bot
- Métricas de comandos ejecutados
- Historial de conexiones/desconexiones
- Errores y logs del bot
- Estadísticas de servidores

### Ejemplo de endpoint de métricas:
```typescript
@Get('metrics/dashboard')
async getDashboardMetrics() {
  const [status, commands, errors] = await Promise.all([
    this.botCommunication.getCurrentBotStatus(),
    this.botService.getCommandStats(),
    this.botService.getRecentErrors(),
  ]);

  return {
    status,
    commands,
    errors,
    timestamp: new Date().toISOString(),
  };
}
```

## 🚀 Despliegue y Producción

### Docker Compose con Redis
```yaml
version: '3.8'

services:
  api:
    build: ./setai-api
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/setai_api
    depends_on:
      - redis
      - postgres

  bot:
    build: ./setai-bot
    environment:
      - REDIS_HOST=redis
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: setai_api
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

## 🔄 Flujo de Trabajo Completo

1. **Bot se inicia** → Publica estado inicial a Redis
2. **API recibe estado** → Actualiza base de datos
3. **Usuario hace request a API** → API consulta estado actual
4. **Usuario toggle comando** → API envía comando a Redis → Bot recibe y ejecuta
5. **Bot ejecuta comando** → Publica estadística a Redis → API actualiza contador
6. **Heartbeat cada 30s** → Bot publica estado → API mantiene estado actualizado

Este sistema permite una comunicación bidireccional robusta entre la API y el bot, manteniendo consistencia de datos y permitiendo control remoto completo del bot desde la API.