# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

The application lives under `crms/` — a NestJS 11 backend. All commands below are run from that directory.

## Commands

```bash
cd crms

# Development
yarn start:dev          # watch mode
yarn build              # compile TypeScript → dist/

# Tests
yarn test               # unit tests
yarn test:watch         # watch mode
yarn test:cov           # with coverage
yarn test:e2e           # end-to-end tests

# Code quality
yarn lint               # ESLint with auto-fix
yarn format             # Prettier (src + test)
```

To run a single test file:
```bash
yarn test -- src/app.service.spec.ts
```

## Architecture

Standard NestJS module structure rooted at `crms/src/`:

- **`main.ts`** — bootstraps `AppModule`, listens on `PORT` (default 3000)
- **Modules** own their controllers (HTTP layer) and services (business logic), wired via NestJS DI
- **`test/`** — E2E tests using Jest + Supertest against a real NestJS app instance
- *.entity.ts — MikroORM entity definitions (uses decorator-based metadata)

TypeScript target is ES2023 with `nodenext` module resolution. ESLint uses the modern flat config (`eslint.config.mjs`). Prettier is set to single quotes with trailing commas.

Database: MikroORM with PostgreSQL. 

Tech Stack
Runtime: NestJS 11, MikroORM 7, TypeScript (strict mode, ESNext target)

