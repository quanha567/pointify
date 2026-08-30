# Pointify Backend

Backend service for Pointify built with **NestJS 12**, **Fastify**, **SWC**, **Vitest**, and **Bun**.

## Tech Stack

- **Framework**: [NestJS 12](https://nestjs.com/) with [Fastify](https://www.fastify.io/) adapter
- **Compiler / Bundler**: [SWC](https://swc.rs/)
- **Linter & Formatter**: [Oxlint](https://oxc.rs/) & [Oxfmt](https://oxc.rs/)
- **Test Runner**: [Vitest](https://vitest.dev/)
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Installation

```bash
bun install
```

### Running the App

```bash
# Development mode with hot-reload
bun run start:dev

# Production build
bun run build

# Start production server
bun run start:prod
```

### Code Quality & Testing

```bash
# Typecheck
bun run typecheck

# Lint with Oxlint
bun run lint
bun run lint:fix

# Format with Oxfmt
bun run format
bun run format:check

# Unit tests
bun run test

# E2E tests
bun run test:e2e
```
