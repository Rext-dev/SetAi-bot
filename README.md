# Setai Bot

> Setai is an autonomous AI-powered Discord bot that lets you configure your Discord server easily and quickly.

## Architecture
- Bot (this repo) → API ← WebApp
- This repository contains only the bot (Node.js 22.18 LTS) and uses pnpm as package manager.

## Features
- Communicate with natural language
- Read, create and edit channels, roles, categories and more
- Compatible with any API/Model (or via OpenAI SDK)
- Adapts to the style and configuration you define
- Public API and WebApp (planned)
- More to come

## Prerequisites
- Node.js 22.x (LTS). Recommended: use Docker or nvm
- pnpm (via corepack):
  ```bash
  corepack enable
  pnpm -v
  ```

## Local Development (pnpm)
- Install dependencies: `pnpm install`
- Environment variables: create a `.env` file with at least:
  ```
  DISCORD_TOKEN=...
  REDIS_URL=redis://localhost:6379
  ```
- Run in dev: `pnpm run dev`
- Run in prod: `pnpm start`
- Tests: `pnpm test`

## Docker
- Recommended base image: `node:22-alpine`
- Reference steps (on your host):
  ```bash
  docker pull node:22-alpine
  docker run -it --rm --entrypoint sh node:22-alpine
  node -v  # should show v22.x
  corepack enable pnpm && pnpm -v
  ```
- Local build of bot image (from repo root):
  ```bash
  docker build -t setai-bot:dev .
  docker run --rm -e DISCORD_TOKEN=... -e REDIS_URL=redis://redis:6379 setai-bot:dev
  ```
- Note: GitHub Actions workflow includes a commented Docker pipeline; uncomment when you have secrets and image defined.

## Monorepo and Services
- Bot: https://github.com/Rext-dev/SetAi-bot (this repo)
- API: (coming soon)
- WebApp: (coming soon)

## 📚 Documentation

The comprehensive technical documentation is available in the `docs/` folder:

### 🚀 Getting Started
- [Installation Guide](docs/requirements/installation-guide.md) - Complete setup instructions
- [Technical Requirements](docs/requirements/technical-requirements.md) - Infrastructure and dependencies

### 🏛️ Architecture
- [Project Architecture](docs/architecture/project-architecture.md) - System design and architecture
- [C4 Architecture Diagrams](docs/diagrams/README.md) - Visual system architecture
- [Process Flowcharts](docs/diagrams/process-flowcharts.md) - Workflow documentation

### 🔌 API & Integration
- [API Specifications](docs/api/api-specifications.md) - REST API documentation
- [Data Models](docs/api/data-models.md) - Database schemas and data structures
- [Command Specifications](docs/requirements/command-specifications.md) - Bot commands and syntax

## Community
- Coming soon

## Contributing
- Read CONTRIBUTING.md for branch flow, PRs and commit conventions
- Use Conventional Commits (feat, fix, chore, docs, etc.)

## License
- Open Source. Proposed: MIT to maximize adoption and contributions