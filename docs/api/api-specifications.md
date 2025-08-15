# API Specifications

## Overview
This document details the REST API specifications for the SetAi Bot system, including endpoints for bot control, monitoring, configuration management, and analytics.

## Base Configuration

### Base URL
```
Production: https://api.setai-bot.com/v1
Development: http://localhost:3000/v1
```

### Authentication
All API endpoints require authentication using JWT tokens obtained through Discord OAuth2.

```http
Authorization: Bearer <jwt_token>
```

### Content Type
```http
Content-Type: application/json
Accept: application/json
```

## Bot Control Endpoints

### Get Bot Status
Retrieve current status and health information for bot instances.

```http
GET /bot/status
```

**Response:**
```json
{
  "status": "online",
  "instances": [
    {
      "id": "bot-instance-1",
      "status": "healthy",
      "uptime": 3600,
      "servers_count": 15,
      "memory_usage": "156MB",
      "last_heartbeat": "2024-08-15T10:30:00Z"
    }
  ],
  "total_servers": 15,
  "total_users": 1247,
  "commands_processed_today": 89
}
```

### Enable/Disable Bot Features
Control specific bot features for servers or globally.

```http
POST /bot/features
```

**Request:**
```json
{
  "server_id": "123456789012345678",
  "features": {
    "natural_language_processing": true,
    "template_management": true,
    "audit_logging": true,
    "advanced_permissions": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Features updated successfully",
  "updated_features": {
    "natural_language_processing": true,
    "template_management": true,
    "audit_logging": true,
    "advanced_permissions": false
  }
}
```

### Execute Bot Command
Programmatically execute bot commands for automation.

```http
POST /bot/execute
```

**Request:**
```json
{
  "server_id": "123456789012345678",
  "command": "create_channels",
  "parameters": {
    "channel_configs": [
      {
        "name": "general-chat",
        "type": "text",
        "category": "General",
        "permissions": [
          {
            "role": "@everyone",
            "allow": ["view_channel", "send_messages"],
            "deny": ["manage_messages"]
          }
        ]
      }
    ]
  },
  "requester_id": "987654321098765432"
}
```

**Response:**
```json
{
  "execution_id": "exec_789123456",
  "status": "completed",
  "results": [
    {
      "channel_id": "111222333444555666",
      "name": "general-chat",
      "created": true,
      "url": "https://discord.com/channels/123456789012345678/111222333444555666"
    }
  ],
  "execution_time": 1.23,
  "errors": []
}
```

## Configuration Management

### Get Server Configuration
Retrieve bot configuration for a specific Discord server.

```http
GET /config/server/{server_id}
```

**Response:**
```json
{
  "server_id": "123456789012345678",
  "server_name": "Awesome Gaming Community",
  "bot_permissions": [
    "manage_channels",
    "manage_roles",
    "send_messages"
  ],
  "features": {
    "natural_language_processing": true,
    "template_management": true,
    "audit_logging": true
  },
  "settings": {
    "command_prefix": "!setai",
    "response_language": "en",
    "auto_cleanup": true,
    "rate_limit_per_user": 10
  },
  "custom_templates": [
    {
      "id": "template_123",
      "name": "Moderation Setup",
      "description": "Standard moderation channel and role setup"
    }
  ]
}
```

### Update Server Configuration
Modify bot configuration for a Discord server.

```http
PUT /config/server/{server_id}
```

**Request:**
```json
{
  "settings": {
    "command_prefix": "!ai",
    "response_language": "en",
    "auto_cleanup": false,
    "rate_limit_per_user": 15
  },
  "features": {
    "natural_language_processing": true,
    "template_management": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "updated_at": "2024-08-15T10:35:00Z"
}
```

### Get Global Configuration
Retrieve system-wide bot configuration.

```http
GET /config/global
```

**Response:**
```json
{
  "ai_service": {
    "provider": "openai",
    "model": "gpt-4",
    "max_tokens": 1000,
    "temperature": 0.7
  },
  "rate_limits": {
    "global_commands_per_minute": 1000,
    "per_server_commands_per_minute": 50,
    "per_user_commands_per_minute": 5
  },
  "cache_settings": {
    "redis_ttl_default": 3600,
    "permission_cache_ttl": 1800,
    "server_data_cache_ttl": 7200
  },
  "monitoring": {
    "health_check_interval": 30,
    "metrics_collection_enabled": true,
    "log_level": "info"
  }
}
```

## Template Management

### List Templates
Get available configuration templates.

```http
GET /templates?server_id={server_id}&category={category}
```

**Query Parameters:**
- `server_id` (optional): Filter templates for specific server
- `category` (optional): Filter by template category

**Response:**
```json
{
  "templates": [
    {
      "id": "template_gaming_001",
      "name": "Gaming Community Setup",
      "description": "Complete setup for gaming communities with voice channels, roles, and permissions",
      "category": "gaming",
      "is_public": true,
      "created_by": "system",
      "usage_count": 1247,
      "rating": 4.8,
      "preview": {
        "channels": 12,
        "roles": 5,
        "categories": 3
      }
    },
    {
      "id": "template_mod_001", 
      "name": "Moderation Setup",
      "description": "Standard moderation channels and roles",
      "category": "moderation",
      "is_public": true,
      "created_by": "system",
      "usage_count": 892,
      "rating": 4.9,
      "preview": {
        "channels": 4,
        "roles": 3,
        "categories": 1
      }
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 10
}
```

### Get Template Details
Retrieve detailed template configuration.

```http
GET /templates/{template_id}
```

**Response:**
```json
{
  "id": "template_gaming_001",
  "name": "Gaming Community Setup",
  "description": "Complete setup for gaming communities",
  "category": "gaming",
  "version": "1.2.0",
  "configuration": {
    "categories": [
      {
        "name": "📝 Information",
        "position": 1,
        "channels": [
          {
            "name": "welcome",
            "type": "text",
            "topic": "Welcome new members!",
            "permissions": [
              {
                "role": "@everyone",
                "allow": ["view_channel"],
                "deny": ["send_messages"]
              }
            ]
          }
        ]
      }
    ],
    "roles": [
      {
        "name": "Gamer",
        "color": "#7289DA",
        "permissions": ["send_messages", "voice_connect"],
        "mentionable": true
      }
    ],
    "variables": [
      {
        "name": "server_name",
        "type": "string",
        "description": "Name of the gaming community",
        "required": true
      }
    ]
  },
  "metadata": {
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-08-01T14:30:00Z",
    "created_by": "system",
    "tags": ["gaming", "community", "voice"],
    "estimated_execution_time": 45
  }
}
```

### Create Custom Template
Create a new custom template.

```http
POST /templates
```

**Request:**
```json
{
  "name": "Study Group Setup",
  "description": "Channels and roles for study groups",
  "category": "education",
  "is_public": false,
  "configuration": {
    "categories": [
      {
        "name": "📚 Study Areas",
        "channels": [
          {
            "name": "general-study",
            "type": "text",
            "topic": "General study discussions"
          },
          {
            "name": "Study Room 1",
            "type": "voice",
            "user_limit": 6
          }
        ]
      }
    ],
    "roles": [
      {
        "name": "Study Buddy",
        "color": "#00FF00",
        "permissions": ["send_messages", "voice_connect"]
      }
    ]
  }
}
```

**Response:**
```json
{
  "id": "template_custom_789",
  "success": true,
  "message": "Template created successfully",
  "template_url": "/templates/template_custom_789"
}
```

## Analytics and Monitoring

### Get Usage Analytics
Retrieve bot usage statistics and analytics.

```http
GET /analytics/usage?period={period}&server_id={server_id}
```

**Query Parameters:**
- `period`: `hour`, `day`, `week`, `month`
- `server_id` (optional): Specific server analytics

**Response:**
```json
{
  "period": "day",
  "data": {
    "commands_executed": 234,
    "successful_commands": 221,
    "failed_commands": 13,
    "unique_users": 89,
    "servers_active": 12,
    "average_response_time": 1.45,
    "ai_requests": 156,
    "cache_hit_rate": 0.87
  },
  "breakdown": {
    "command_types": {
      "channel_management": 89,
      "role_management": 67,
      "template_application": 45,
      "server_configuration": 23,
      "other": 10
    },
    "hourly_distribution": [
      {"hour": 0, "commands": 8},
      {"hour": 1, "commands": 5},
      {"hour": 2, "commands": 3}
    ]
  }
}
```

### Get Performance Metrics
Retrieve system performance metrics.

```http
GET /analytics/performance
```

**Response:**
```json
{
  "system_health": {
    "status": "healthy",
    "uptime": 2592000,
    "cpu_usage": 0.45,
    "memory_usage": 0.62,
    "disk_usage": 0.23
  },
  "bot_instances": [
    {
      "id": "bot-1",
      "status": "healthy",
      "response_time_avg": 1.23,
      "commands_per_minute": 4.2,
      "error_rate": 0.02
    }
  ],
  "database_metrics": {
    "mysql_connections": 12,
    "mysql_query_time_avg": 0.089,
    "redis_connections": 8,
    "redis_memory_usage": "245MB",
    "cache_hit_rate": 0.89
  },
  "api_metrics": {
    "requests_per_minute": 23.4,
    "average_response_time": 0.234,
    "error_rate": 0.001,
    "active_sessions": 145
  }
}
```

### Get Error Reports
Retrieve error reports and system issues.

```http
GET /analytics/errors?severity={severity}&limit={limit}
```

**Query Parameters:**
- `severity`: `low`, `medium`, `high`, `critical`
- `limit`: Number of records to return (default: 50)

**Response:**
```json
{
  "errors": [
    {
      "id": "error_123456",
      "timestamp": "2024-08-15T10:25:30Z",
      "severity": "medium",
      "type": "ai_service_timeout",
      "message": "AI service request timed out after 30s",
      "affected_command": "create_channels",
      "server_id": "123456789012345678",
      "user_id": "987654321098765432",
      "context": {
        "command_text": "create 3 voice channels for team meetings",
        "execution_time": 30.1,
        "retry_count": 2
      },
      "resolution": "fallback_parser_used",
      "resolution_time": 1.5
    }
  ],
  "summary": {
    "total_errors": 45,
    "by_severity": {
      "low": 30,
      "medium": 12,
      "high": 3,
      "critical": 0
    },
    "most_common_types": [
      {"type": "ai_service_timeout", "count": 15},
      {"type": "permission_denied", "count": 12},
      {"type": "rate_limit_exceeded", "count": 8}
    ]
  }
}
```

## Audit and Logging

### Get Audit Logs
Retrieve audit logs for compliance and debugging.

```http
GET /audit/logs?server_id={server_id}&user_id={user_id}&action={action}&start_date={start}&end_date={end}
```

**Query Parameters:**
- `server_id` (optional): Filter by Discord server
- `user_id` (optional): Filter by Discord user
- `action` (optional): Filter by action type
- `start_date`, `end_date`: Date range filter (ISO 8601)

**Response:**
```json
{
  "logs": [
    {
      "id": "log_789123456",
      "timestamp": "2024-08-15T10:30:15Z",
      "server_id": "123456789012345678",
      "server_name": "Gaming Community",
      "user_id": "987654321098765432",
      "username": "AdminUser#1234",
      "action": "channel_created",
      "details": {
        "channel_name": "team-voice-1",
        "channel_type": "voice",
        "channel_id": "111222333444555777",
        "category": "Team Rooms",
        "permissions_applied": 3
      },
      "command_text": "create voice channel for team meetings",
      "execution_time": 2.34,
      "status": "success",
      "ip_address": "192.168.1.100",
      "user_agent": "Discord Bot API v1.0"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "per_page": 50,
    "total_pages": 25
  }
}
```

## WebSocket Events

### Real-time Event Subscription
Subscribe to real-time events for monitoring and live updates.

```javascript
// WebSocket connection
const ws = new WebSocket('wss://api.setai-bot.com/v1/events');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'jwt_token_here'
}));

// Subscribe to specific events
ws.send(JSON.stringify({
  type: 'subscribe',
  events: ['command_executed', 'error_occurred', 'bot_status_changed']
}));
```

**Event Types:**
- `command_executed`: When a bot command is executed
- `error_occurred`: When system errors occur
- `bot_status_changed`: When bot status changes
- `config_updated`: When configuration is modified
- `template_applied`: When templates are used

**Example Event:**
```json
{
  "type": "command_executed",
  "timestamp": "2024-08-15T10:30:00Z",
  "data": {
    "execution_id": "exec_123456",
    "server_id": "123456789012345678",
    "user_id": "987654321098765432",
    "command": "create_channels",
    "status": "success",
    "execution_time": 1.89
  }
}
```

## Error Responses

### Standard Error Format
All API errors follow a consistent format:

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to perform this action",
    "details": {
      "required_permission": "manage_channels",
      "user_permissions": ["send_messages", "view_channel"]
    },
    "timestamp": "2024-08-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TOKEN` | 401 | Authentication token is invalid or expired |
| `PERMISSION_DENIED` | 403 | Insufficient permissions for the requested action |
| `SERVER_NOT_FOUND` | 404 | Discord server not found or bot not in server |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests, rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI processing service is unavailable |
| `INTERNAL_ERROR` | 500 | Internal server error occurred |

---

**Document Type**: API Specifications  
**Version**: 1.0  
**Last Updated**: August 2024  
**Related**: [Data Models](./data-models.md)