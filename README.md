# SetAi Bot

An intelligent Discord bot with AI integration for automated server configuration through natural language commands.

## 🎯 Overview

SetAi Bot transforms Discord server management from manual, time-consuming tasks to simple conversational commands. Users can configure entire server setups using natural language, and the bot intelligently interprets and executes complex configuration tasks.

**Example Interaction:**
> User: *"Create 3 private text channels for the moderation team"*  
> Bot: Automatically creates channels, assigns permissions, and organizes them into categories.

## ✨ Key Features

- **🤖 Natural Language Processing**: Command the bot using everyday English
- **⚡ Automated Server Setup**: Complete Discord server configuration in minutes
- **🎯 Intelligent Interpretation**: AI-powered command understanding and execution
- **🛡️ Advanced Permission Management**: Granular control over roles and permissions
- **📋 Configuration Templates**: Reusable setups for different server types
- **📊 Real-time Monitoring**: API and web dashboard for bot management
- **🔒 Security First**: Multi-layer permission validation and audit logging

## 🏗️ Architecture

SetAi Bot follows a modern microservices architecture:

- **Discord Bot**: Core bot application with AI integration
- **API Service**: RESTful API for bot control and monitoring
- **AI Processor**: Dedicated natural language processing service
- **Redis Cache**: High-performance caching and pub/sub messaging
- **MySQL Database**: Persistent storage for configurations and audit logs
- **Web Dashboard**: Administrative interface for server managers

![System Context](docs/diagrams/c4-level1-system-context.md)

## 📚 Documentation

### 🚀 Getting Started
- [Installation Guide](docs/requirements/installation-guide.md) - Complete setup instructions
- [Quick Start](docs/requirements/installation-guide.md#quick-start-development) - Get running in 5 minutes
- [Configuration](docs/requirements/technical-requirements.md) - Environment setup and configuration

### 🏛️ Architecture
- [Project Architecture](docs/architecture/project-architecture.md) - Comprehensive system design
- [C4 Architecture Diagrams](docs/diagrams/README.md) - Visual system architecture
- [Process Flowcharts](docs/diagrams/process-flowcharts.md) - Workflow and process documentation

### 🔌 API & Integration
- [API Specifications](docs/api/api-specifications.md) - Complete REST API documentation
- [Data Models](docs/api/data-models.md) - Database schemas and data structures
- [Command Specifications](docs/requirements/command-specifications.md) - Bot commands and syntax

### 🛠️ Technical Details
- [Technical Requirements](docs/requirements/technical-requirements.md) - Infrastructure and dependencies
- [Installation Guide](docs/requirements/installation-guide.md) - Deployment and operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+
- Docker and Docker Compose
- Discord Developer Application
- OpenAI API key (or alternative AI service)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/Rext-dev/SetAi-bot.git
cd SetAi-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your Discord bot token and AI API key in .env

# Start development environment
docker-compose up -d mysql redis
npm run dev
```

### Add Bot to Discord Server
1. Create a Discord Application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Generate an invite link with required permissions
3. Add the bot to your Discord server
4. Start using natural language commands!

## 💬 Example Commands

### Natural Language Commands
```
"Create a voice channel called Team Meeting Room"
"Set up moderation channels with proper permissions"
"Apply the Gaming Community template to this server"
"Give @user123 the VIP role with custom permissions"
"Create 5 study rooms in the Education category"
```

### Slash Commands
```
/create-channel general-chat --type text --category General
/apply-template gaming-community
/assign-role @user123 Moderator
/bot-config ai_enabled true
```

### Text Commands
```
!setai create channel "team-voice" --type voice --limit 8
!setai help commands
!setai status
```

## 🔐 Security & Permissions

SetAi Bot implements multiple security layers:
- **Discord OAuth2** authentication for users
- **Role-based access control** with server-specific rules  
- **Permission validation** at user, bot, and server levels
- **Audit logging** for all configuration changes
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Complete documentation](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/Rext-dev/SetAi-bot/issues)
- **Discord Support**: [Join our Discord server](https://discord.gg/setai-bot)
- **Email**: support@setai-bot.com

## 🗺️ Roadmap

### Phase 1: Core Implementation (Q3 2024)
- [x] Basic natural language command processing
- [x] Essential Discord configuration (channels, roles)
- [x] Simple API for bot control
- [x] Redis caching implementation

### Phase 2: Advanced Features (Q4 2024)
- [ ] Complex multi-step configurations
- [ ] Custom template system
- [ ] Web dashboard for server admins
- [ ] Advanced analytics and reporting

### Phase 3: AI Enhancement (Q1 2025)
- [ ] Learning from user patterns
- [ ] Predictive configuration suggestions
- [ ] Voice command integration
- [ ] Multi-language support

## ⭐ Show Your Support

If this project helps you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code or documentation
- 📢 Sharing with others who might find it useful

---

**Built with ❤️ by the SetAi Bot Team**
