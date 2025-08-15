# Command Specifications

## Overview
This document defines the complete command interface for the SetAi Discord Bot, including natural language commands, slash commands, and text-based commands with their syntax, parameters, and expected behaviors.

## Command Categories

### Channel Management Commands

#### Create Channels
**Natural Language Examples:**
- "Create a text channel called general-chat"
- "Make 3 voice channels for team meetings"
- "Set up private channels for the moderation team"
- "Create a category called Gaming with 5 voice channels"

**Slash Command:**
```
/create-channel <name> [type] [category] [private] [user-limit]
```

**Text Command:**
```
!setai create channel <name> --type <text|voice|category> --category <category_name> --private <true|false> --limit <number>
```

**Parameters:**
```typescript
interface CreateChannelParams {
  name: string;                    // Channel name (required)
  type: 'text' | 'voice' | 'category' | 'stage' | 'forum';  // Default: text
  category?: string;               // Parent category name or ID
  topic?: string;                  // Channel topic/description
  private?: boolean;               // Private channel (default: false)
  user_limit?: number;             // Voice channel user limit (2-99)
  bitrate?: number;                // Voice channel bitrate (8-384 kbps)
  rate_limit?: number;             // Slowmode in seconds (0-21600)
  nsfw?: boolean;                  // NSFW channel (default: false)
  permissions?: PermissionOverride[]; // Custom permissions
}
```

**Response Format:**
```json
{
  "success": true,
  "command": "create_channel",
  "results": [
    {
      "channel_id": "123456789012345678",
      "name": "general-chat",
      "type": "text",
      "url": "https://discord.com/channels/server_id/123456789012345678",
      "category": "General"
    }
  ],
  "execution_time": 1.23
}
```

#### Modify Channels
**Natural Language Examples:**
- "Rename the general channel to community-chat"
- "Move the voice channel to the Gaming category"
- "Set the user limit for Team Voice 1 to 8 people"
- "Make the announcements channel private"

**Slash Command:**
```
/modify-channel <channel> [name] [category] [topic] [private] [user-limit]
```

**Parameters:**
```typescript
interface ModifyChannelParams {
  channel: string;                 // Channel name, mention, or ID
  name?: string;                   // New channel name
  topic?: string;                  // New channel topic
  category?: string;               // Move to category
  user_limit?: number;             // Voice channel user limit
  private?: boolean;               // Change privacy setting
  rate_limit?: number;             // Slowmode setting
  permissions?: PermissionOverride[]; // Update permissions
}
```

#### Delete Channels
**Natural Language Examples:**
- "Delete the old-announcements channel"
- "Remove all channels in the Temporary category"
- "Clean up unused voice channels"

**Slash Command:**
```
/delete-channel <channel> [confirm]
```

**Safety Features:**
- Confirmation required for deletion
- Backup of channel data before deletion
- Cannot delete system channels
- Admin permission verification

### Role Management Commands

#### Create Roles
**Natural Language Examples:**
- "Create a Moderator role with channel management permissions"
- "Make a VIP role with a golden color"
- "Set up game roles for different teams"
- "Create a temporary role for event participants"

**Slash Command:**
```
/create-role <name> [color] [permissions] [mentionable] [hoisted]
```

**Parameters:**
```typescript
interface CreateRoleParams {
  name: string;                    // Role name (required)
  color?: string;                  // Hex color code or color name
  permissions?: DiscordPermission[]; // Role permissions
  mentionable?: boolean;           // Can be mentioned (default: true)
  hoisted?: boolean;               // Display separately (default: false)
  position?: number;               // Role hierarchy position
  icon?: string;                   // Role icon (emoji or image URL)
  reason?: string;                 // Audit log reason
}
```

**Permission Presets:**
```typescript
const PERMISSION_PRESETS = {
  'moderator': [
    'kick_members', 'ban_members', 'manage_messages', 
    'manage_channels', 'view_audit_log'
  ],
  'vip': [
    'priority_speaker', 'use_external_emojis', 
    'add_reactions', 'embed_links'
  ],
  'member': [
    'send_messages', 'view_channel', 'connect', 
    'speak', 'use_voice_activation'
  ]
};
```

#### Assign Roles
**Natural Language Examples:**
- "Give @user123 the Moderator role"
- "Add the VIP role to all users with 'supporter' in their name"
- "Remove the Muted role from @troublemaker"

**Slash Command:**
```
/assign-role <user> <role> [action]
```

**Parameters:**
```typescript
interface AssignRoleParams {
  user: string | string[];         // User mention, ID, or array of users
  role: string;                    // Role name, mention, or ID
  action: 'add' | 'remove' | 'toggle'; // Default: add
  reason?: string;                 // Audit log reason
  duration?: number;               // Temporary role duration (minutes)
  notify_user?: boolean;           // Send DM notification (default: false)
}
```

### Permission Management Commands

#### Set Channel Permissions
**Natural Language Examples:**
- "Give the Moderator role permission to manage messages in #general"
- "Block @everyone from sending messages in #announcements"
- "Allow VIPs to connect to all voice channels"

**Slash Command:**
```
/set-permissions <target> <channel> <permissions>
```

**Parameters:**
```typescript
interface SetPermissionsParams {
  target: string;                  // Role or user mention/ID
  target_type: 'role' | 'user';    // Target type
  channel?: string;                // Channel (if not specified, server-wide)
  allow?: DiscordPermission[];     // Permissions to allow
  deny?: DiscordPermission[];      // Permissions to deny
  inherit?: boolean;               // Inherit from category (default: true)
  reason?: string;                 // Audit log reason
}
```

### Server Configuration Commands

#### Configure Server Settings
**Natural Language Examples:**
- "Set the verification level to medium"
- "Enable community features for this server"
- "Change the AFK timeout to 15 minutes"
- "Set #general as the system messages channel"

**Slash Command:**
```
/configure-server <setting> <value>
```

**Available Settings:**
```typescript
interface ServerSettings {
  verification_level: 'none' | 'low' | 'medium' | 'high' | 'very_high';
  default_notifications: 'all_messages' | 'only_mentions';
  explicit_content_filter: 'disabled' | 'members_without_roles' | 'all_members';
  afk_timeout: 60 | 300 | 900 | 1800 | 3600; // seconds
  afk_channel?: string;            // AFK voice channel
  system_channel?: string;         // System messages channel
  rules_channel?: string;          // Rules channel (community servers)
  public_updates_channel?: string; // Public updates channel
  preferred_locale: string;        // Server language
  features: string[];              // Server features to enable
}
```

### Template Commands

#### Apply Templates
**Natural Language Examples:**
- "Apply the Gaming Community template to this server"
- "Set up a basic moderation structure"
- "Use the Education template with 5 study rooms"

**Slash Command:**
```
/apply-template <template> [variables]
```

**Parameters:**
```typescript
interface ApplyTemplateParams {
  template: string;                // Template name or ID
  variables?: Record<string, any>; // Template variables
  preview?: boolean;               // Show preview before applying
  overwrite?: boolean;             // Overwrite existing channels/roles
  backup?: boolean;                // Create backup before applying
}
```

#### Create Custom Templates
**Natural Language Examples:**
- "Save the current server setup as a template called 'My Community'"
- "Create a template from the Gaming category"

**Slash Command:**
```
/create-template <name> [description] [include]
```

**Parameters:**
```typescript
interface CreateTemplateParams {
  name: string;                    // Template name
  description?: string;            // Template description
  include: {
    channels?: boolean;            // Include channels (default: true)
    roles?: boolean;               // Include roles (default: true)
    permissions?: boolean;         // Include permissions (default: true)
    categories?: boolean;          // Include categories (default: true)
    settings?: boolean;            // Include server settings (default: false)
  };
  public?: boolean;                // Make template public (default: false)
  category?: string;               // Template category
}
```

### Bulk Operations Commands

#### Bulk Channel Operations
**Natural Language Examples:**
- "Create 10 voice channels named Team Room 1 through Team Room 10"
- "Delete all channels with 'temp' in their name"
- "Move all voice channels to the Gaming category"

**Slash Command:**
```
/bulk-channels <operation> [pattern] [parameters]
```

**Parameters:**
```typescript
interface BulkChannelParams {
  operation: 'create' | 'delete' | 'modify' | 'move';
  pattern?: string;                // Pattern for selection or naming
  count?: number;                  // Number of channels to create
  template?: ChannelConfig;        // Template for new channels
  filter?: {
    type?: ChannelType[];          // Channel types to include
    category?: string;             // Specific category
    inactive_days?: number;        // Channels inactive for X days
    empty?: boolean;               // Empty voice channels
  };
  confirm?: boolean;               // Require confirmation
}
```

#### Bulk Role Operations
**Natural Language Examples:**
- "Give everyone with 'gamer' in their name the Gaming role"
- "Remove all temporary roles created in the last week"
- "Create team roles for Red, Blue, Green, and Yellow teams"

**Slash Command:**
```
/bulk-roles <operation> [pattern] [parameters]
```

### Utility Commands

#### Bot Configuration
**Natural Language Examples:**
- "Change the command prefix to !ai"
- "Enable AI interpretation for this server"
- "Set the response language to Spanish"

**Slash Command:**
```
/bot-config <setting> <value>
```

**Bot Settings:**
```typescript
interface BotConfiguration {
  command_prefix: string;          // Command prefix (default: !setai)
  response_language: string;       // ISO language code
  ai_enabled: boolean;             // Enable AI interpretation
  ai_confidence_threshold: number; // AI confidence threshold (0.0-1.0)
  auto_cleanup: boolean;           // Auto-cleanup temporary channels
  audit_logging: boolean;          // Enable audit logging
  rate_limit_strict: boolean;      // Strict rate limiting
  permissions_strict: boolean;     // Strict permission checking
}
```

#### Help and Information
**Natural Language Examples:**
- "How do I create a voice channel?"
- "Show me all available commands"
- "What permissions does this bot need?"

**Slash Command:**
```
/help [command] [category]
```

**Help Categories:**
- `channels` - Channel management commands
- `roles` - Role management commands
- `permissions` - Permission commands
- `templates` - Template commands
- `bulk` - Bulk operation commands
- `config` - Configuration commands

#### Status and Diagnostics
**Slash Command:**
```
/bot-status
/server-info
/permissions-check
```

## Command Syntax Rules

### Natural Language Processing

#### Intent Recognition
The AI system recognizes the following primary intents:
```typescript
enum CommandIntent {
  CREATE = 'create',
  MODIFY = 'modify', 
  DELETE = 'delete',
  CONFIGURE = 'configure',
  ASSIGN = 'assign',
  REMOVE = 'remove',
  APPLY = 'apply',
  LIST = 'list',
  HELP = 'help'
}
```

#### Entity Extraction
Common entities extracted from natural language:
```typescript
interface ExtractedEntities {
  action: string;                  // Primary action (create, delete, etc.)
  target_type: 'channel' | 'role' | 'permission' | 'setting';
  target_name?: string;            // Name of target
  quantity?: number;               // Number (when creating multiple)
  properties?: Record<string, any>; // Additional properties
  conditions?: string[];           // Conditional statements
}
```

#### Context Understanding
The AI maintains context for:
- Previous commands in the conversation
- Server-specific settings and preferences
- User permission levels
- Recent server activity

### Command Validation

#### Pre-execution Validation
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions?: string[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

#### Permission Validation
All commands undergo multi-layer permission checking:
1. **User Discord Permissions** - User's permissions in the server
2. **Bot Discord Permissions** - Bot's permissions to perform the action
3. **SetAi Bot Permissions** - Bot-specific permission configuration
4. **Server Rules** - Custom server-specific rules

#### Safety Checks
Critical operations include safety mechanisms:
- **Confirmation Required** - For destructive operations
- **Dry Run Mode** - Preview changes before execution
- **Rollback Capability** - Undo recent changes
- **Rate Limiting** - Prevent spam and abuse

## Command Response Formats

### Success Response
```json
{
  "success": true,
  "command": "create_channel",
  "execution_id": "exec_123456",
  "results": [
    {
      "action": "channel_created",
      "target_id": "123456789012345678",
      "target_name": "general-chat",
      "details": {
        "type": "text",
        "category": "General",
        "permissions_applied": 3
      }
    }
  ],
  "execution_time": 1.23,
  "timestamp": "2024-08-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "command": "create_channel",
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Bot lacks permission to create channels",
    "details": {
      "required_permission": "manage_channels",
      "bot_permissions": ["send_messages", "view_channel"]
    }
  },
  "suggestions": [
    "Ask a server administrator to grant the bot 'Manage Channels' permission",
    "Try creating the channel manually and ask the bot to configure it instead"
  ],
  "timestamp": "2024-08-15T10:30:00Z"
}
```

### Partial Success Response
```json
{
  "success": true,
  "command": "bulk_create_channels",
  "execution_id": "exec_789123",
  "results": [
    {
      "action": "channel_created",
      "target_name": "team-room-1",
      "success": true
    },
    {
      "action": "channel_created", 
      "target_name": "team-room-2",
      "success": false,
      "error": "Channel name already exists"
    }
  ],
  "summary": {
    "successful": 1,
    "failed": 1,
    "total": 2
  },
  "execution_time": 2.45
}
```

## Advanced Features

### Multi-step Commands
Some commands require multiple steps or user input:

```typescript
interface MultiStepCommand {
  execution_id: string;
  current_step: number;
  total_steps: number;
  steps: CommandStep[];
  context: Record<string, any>;
}

interface CommandStep {
  step_number: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requires_input?: boolean;
  input_prompt?: string;
  result?: any;
}
```

### Command Macros
Users can create command macros for frequently used operations:

```typescript
interface CommandMacro {
  name: string;
  description: string;
  commands: CommandSequence[];
  variables?: MacroVariable[];
}

interface CommandSequence {
  command: string;
  parameters: Record<string, any>;
  wait_for_completion: boolean;
  on_error: 'stop' | 'continue' | 'rollback';
}
```

### Scheduled Commands
Commands can be scheduled for future execution:

```typescript
interface ScheduledCommand {
  schedule_id: string;
  command: string;
  parameters: Record<string, any>;
  schedule: {
    type: 'once' | 'recurring';
    datetime?: Date;
    cron_expression?: string;
    timezone?: string;
  };
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}
```

## Error Handling and Recovery

### Common Error Scenarios
1. **Insufficient Permissions** - User or bot lacks required permissions
2. **Invalid Parameters** - Malformed or invalid command parameters
3. **Resource Conflicts** - Channel/role names already exist
4. **Rate Limiting** - Discord API rate limits exceeded
5. **Service Unavailability** - External services (AI, database) unavailable

### Recovery Strategies
- **Automatic Retry** - For transient errors (network timeouts)
- **Graceful Degradation** - Fallback to basic functionality
- **User Guidance** - Clear error messages with suggested solutions
- **Admin Escalation** - Notify administrators for permission issues

### Rollback Mechanisms
Critical operations support rollback:
```typescript
interface RollbackOperation {
  execution_id: string;
  rollback_data: any;
  can_rollback: boolean;
  rollback_expiry: Date;
}
```

---

**Document Type**: Command Specifications  
**Version**: 1.0  
**Last Updated**: August 2024  
**Related**: [API Specifications](../api/api-specifications.md)