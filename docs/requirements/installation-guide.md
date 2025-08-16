# Installation Guide

## Overview
This guide provides step-by-step instructions for setting up the SetAi Discord Bot in development, staging, and production environments.

## Quick Start (Development)

### Prerequisites Checklist
- [ ] Node.js 18.0+ installed
- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] Discord Developer Application created
- [ ] OpenAI API key (or alternative AI service)

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/Rext-dev/SetAi-bot.git
cd SetAi-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Environment Configuration
Edit the `.env` file with your configuration:

```bash
# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id
DISCORD_CLIENT_SECRET=your_client_secret

# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
AI_SERVICE_PROVIDER=openai
AI_MODEL=gpt-4

# Database Configuration (Development)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=setai_user
MYSQL_PASSWORD=secure_password
MYSQL_DATABASE=setai_bot_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Application Configuration
NODE_ENV=development
LOG_LEVEL=debug
API_PORT=3000
BOT_COMMAND_PREFIX=!setai

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

### 3. Discord Bot Setup
1. **Create Discord Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and name it "SetAi Bot"
   - Go to "Bot" section and click "Add Bot"
   - Copy the bot token to your `.env` file

2. **Configure Bot Permissions**:
   ```
   Required Permissions:
   ✅ Send Messages
   ✅ Manage Channels
   ✅ Manage Roles
   ✅ Read Message History
   ✅ Add Reactions
   ✅ Use Slash Commands
   ```

3. **Generate Invite Link**:
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
   ```

### 4. Start Development Environment
```bash
# Start infrastructure services
docker-compose up -d mysql redis

# Wait for services to be ready
./scripts/wait-for-services.sh

# Run database migrations
npm run migrate

# Seed development data
npm run seed

# Start the application in development mode
npm run dev
```

### 5. Verify Installation
```bash
# Check bot status
curl http://localhost:3000/v1/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "bot": "online",
    "database": "connected",
    "cache": "connected",
    "ai_service": "available"
  }
}
```

## Production Installation

### Prerequisites
- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose
- SSL certificate for HTTPS
- Domain name for API service
- Firewall configured

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y nginx certbot python3-certbot-nginx git htop
```

### 2. Application Deployment
```bash
# Create application directory
sudo mkdir -p /opt/setai-bot
sudo chown $USER:$USER /opt/setai-bot
cd /opt/setai-bot

# Clone production branch
git clone -b main https://github.com/Rext-dev/SetAi-bot.git .

# Create production environment file
sudo cp .env.production.example .env.production
sudo chmod 600 .env.production

# Configure production environment
sudo nano .env.production
```

### 3. Production Environment Configuration
```bash
# Production Environment Variables
NODE_ENV=production
LOG_LEVEL=info

# Discord Configuration
DISCORD_BOT_TOKEN=prod_bot_token
DISCORD_CLIENT_ID=prod_client_id
DISCORD_CLIENT_SECRET=prod_client_secret

# Database Configuration
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USERNAME=setai_prod
MYSQL_PASSWORD=secure_production_password
MYSQL_DATABASE=setai_bot_prod
MYSQL_ROOT_PASSWORD=super_secure_root_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password

# AI Service Configuration
OPENAI_API_KEY=prod_openai_key
AI_SERVICE_PROVIDER=openai
AI_MODEL=gpt-4
AI_RATE_LIMIT_PER_HOUR=1000

# Security Configuration
JWT_SECRET=production_jwt_secret_256_bits
ENCRYPTION_KEY=production_encryption_key_256_bits
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true
PROMETHEUS_PORT=9090
GRAFANA_ADMIN_PASSWORD=secure_grafana_password

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=setai-bot-backups
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 4. SSL Certificate Setup
```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d api.your-domain.com

# Verify automatic renewal
sudo certbot renew --dry-run
```

### 5. NGINX Configuration
```nginx
# /etc/nginx/sites-available/setai-bot
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API proxy
    location /v1/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /v1/events {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/v1/health;
        access_log off;
    }
}
```

### 6. Production Deployment
```bash
# Enable and start NGINX
sudo systemctl enable nginx
sudo systemctl start nginx

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run production migrations
docker-compose -f docker-compose.prod.yml exec api npm run migrate:prod

# Verify deployment
curl -k https://api.your-domain.com/v1/health
```

### 7. Monitoring Setup
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access monitoring interfaces
# Grafana: https://monitor.your-domain.com:3000
# Prometheus: https://monitor.your-domain.com:9090
```

## Database Setup

### MySQL Installation and Configuration
```sql
-- Create production database and user
CREATE DATABASE setai_bot_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'setai_prod'@'%' IDENTIFIED BY 'secure_production_password';
GRANT ALL PRIVILEGES ON setai_bot_prod.* TO 'setai_prod'@'%';
FLUSH PRIVILEGES;

-- Configure MySQL for production
-- /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
max_connections = 200
query_cache_size = 0
query_cache_type = 0
```

### Database Migration
```bash
# Development migrations
npm run migrate

# Production migrations
NODE_ENV=production npm run migrate

# Rollback if needed
npm run migrate:rollback

# Create new migration
npm run migrate:create -- create_new_table
```

### Redis Configuration
```redis
# /etc/redis/redis.conf for production
bind 0.0.0.0
port 6379
requireauth secure_redis_password
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Container Configuration

### Development Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: setai_bot_dev
      MYSQL_USER: setai_user
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7.0-alpine
    command: redis-server --requirepass password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - mysql

volumes:
  mysql_data:
  redis_data:
```

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  bot:
    build: 
      context: .
      dockerfile: Dockerfile.bot
    env_file: .env.production
    restart: unless-stopped
    depends_on:
      - mysql
      - redis
    networks:
      - setai-network

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    env_file: .env.production
    ports:
      - "3000:3000"
    restart: unless-stopped
    depends_on:
      - mysql
      - redis
    networks:
      - setai-network

  ai-processor:
    build:
      context: .
      dockerfile: Dockerfile.ai
    env_file: .env.production
    restart: unless-stopped
    depends_on:
      - redis
    networks:
      - setai-network

  mysql:
    image: mysql:8.0
    env_file: .env.production
    ports:
      - "3306:3306"
    volumes:
      - mysql_prod_data:/var/lib/mysql
      - ./config/mysql:/etc/mysql/conf.d
    restart: unless-stopped
    networks:
      - setai-network

  redis:
    image: redis:7.0-alpine
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis_prod_data:/data
      - ./config/redis/redis.conf:/usr/local/etc/redis/redis.conf
    restart: unless-stopped
    networks:
      - setai-network

networks:
  setai-network:
    driver: bridge

volumes:
  mysql_prod_data:
  redis_prod_data:
```

## Monitoring and Logging

### Logging Configuration
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'setai-bot' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Check Endpoints
```javascript
// API health check endpoint
app.get('/v1/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      bot: await checkBotHealth(),
      database: await checkDatabaseHealth(),
      cache: await checkRedisHealth(),
      ai_service: await checkAIServiceHealth()
    }
  };
  
  const isHealthy = Object.values(health.services).every(status => 
    status === 'healthy' || status === 'connected' || status === 'available'
  );
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/backups/setai-bot"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="setai_backup_${TIMESTAMP}.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD setai_bot_prod > $BACKUP_DIR/db_$TIMESTAMP.sql

# Redis backup
docker-compose exec -T redis redis-cli --rdb /data/dump_$TIMESTAMP.rdb

# Application data backup
tar -czf $BACKUP_DIR/$BACKUP_FILE \
  --exclude=node_modules \
  --exclude=.git \
  /opt/setai-bot

# Upload to S3 (if configured)
if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
  aws s3 cp $BACKUP_DIR/$BACKUP_FILE s3://$BACKUP_S3_BUCKET/
fi

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

### Recovery Procedures
```bash
# Database recovery
mysql -u root -p < backup_file.sql

# Redis recovery
redis-cli --rdb dump.rdb

# Application recovery
tar -xzf backup_file.tar.gz -C /opt/setai-bot
```

## Troubleshooting

### Common Issues and Solutions

#### Bot Won't Connect to Discord
```bash
# Check Discord token
echo $DISCORD_BOT_TOKEN | wc -c  # Should be 59 characters

# Verify bot permissions
curl -H "Authorization: Bot $DISCORD_BOT_TOKEN" https://discord.com/api/v10/users/@me

# Check logs
docker-compose logs bot
```

#### Database Connection Issues
```bash
# Test MySQL connection
mysql -h localhost -u setai_user -p setai_bot_dev

# Check MySQL status
docker-compose ps mysql
docker-compose logs mysql

# Verify environment variables
grep MYSQL .env
```

#### Redis Connection Problems
```bash
# Test Redis connection
redis-cli -h localhost -p 6379 -a password ping

# Check Redis logs
docker-compose logs redis

# Monitor Redis
redis-cli -h localhost -p 6379 -a password monitor
```

#### AI Service Integration Issues
```bash
# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check AI service logs
docker-compose logs ai-processor

# Verify rate limits
redis-cli -h localhost -p 6379 -a password get "ratelimit:ai:*"
```

### Performance Tuning
```bash
# Monitor resource usage
docker stats

# Database performance
mysql -u root -p -e "SHOW PROCESSLIST;"
mysql -u root -p -e "SHOW ENGINE INNODB STATUS\G"

# Redis performance
redis-cli -h localhost -p 6379 -a password info stats
redis-cli -h localhost -p 6379 -a password slowlog get 10
```

### Log Analysis
```bash
# Application logs
tail -f logs/combined.log | jq

# Error analysis
grep ERROR logs/combined.log | jq

# Performance monitoring
grep "execution_time" logs/combined.log | jq '.execution_time' | sort -n
```

---

**Document Type**: Installation Guide  
**Version**: 1.0  
**Last Updated**: August 2024  
**Related**: [Technical Requirements](./technical-requirements.md)