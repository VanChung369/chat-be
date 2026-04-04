---
name: chat-be
description: Implement and evolve this NestJS chat backend with repo-consistent module, service, repository, and TypeORM patterns. Auto-use when requests involve auth, users, peers, mail, image-storage, cache/redis, BullMQ, TypeORM entities or repositories, NestJS controllers/modules/guards, environment config, backend bug fixes, validation, or refactors in this repo.
---

# Chat Backend NestJS Dev

## Automatic Invocation Signals

Use this skill by default when the request is about this repository's backend, including:

- Adding or fixing NestJS modules, controllers, services, guards, or providers.
- Updating TypeORM entities, repositories, relations, migrations, or database-backed flows.
- Modifying auth, session, verification, mail, peer, user profile, cache, redis, or image upload behavior.
- Adjusting DTO-like params, validation, env-driven config, tests, or backend refactors.

Do not use this skill for frontend-only work or infrastructure outside this repository.

## Quick Start

1. Clarify the feature outcome and affected request flow before editing.
2. Read the minimum references needed for the task:
- Read `references/architecture-map.md` for module ownership and cross-module wiring.
- Read `references/backend-patterns.md` for implementation conventions.
- Read `references/feature-checklist.md` before finalizing changes.
3. Reuse existing modules, repositories, entities, and service boundaries before adding abstractions.
4. Validate with the narrowest meaningful build, test, or manual check.

## Feature Workflow

### 1) Analyze

- Identify the request path: controller entrypoint, service orchestration, repository/entity persistence, and side effects.
- Confirm which module owns the behavior and whether another module should only be consumed, not duplicated.
- Check nearby files first and mirror the dominant local style.

### 2) Implement

- Keep changes inside the smallest valid module boundary.
- Prefer extending existing repositories and services over introducing parallel helpers.
- Keep entity and persistence changes aligned with current TypeORM usage.
- Keep env-driven behavior explicit and consistent with existing config in `src/app.module.ts`.

### 3) Verify

- Run the smallest meaningful validation first.
- Rebuild or run focused tests when behavior, typing, or DI wiring changes.
- Check auth/session or persistence regressions when touching shared flows.

### 4) Finalize

- Summarize changed files and behavior impact.
- Call out unvalidated paths, env assumptions, or migration follow-up clearly.

## Repository Conventions

- Start from the owning Nest module and keep controller, service, and repository responsibilities separated.
- Use `TypeOrmModule.forFeature(...)` in the owning module for injected entities and repositories.
- Reuse `BaseRepository` in `src/common/repositories/base.repository.ts` for shared repository operations before adding new custom methods.
- Keep business logic in services; keep controllers thin and repository methods persistence-focused.
- Follow existing TypeORM entity style under `src/common/entities/*` and remember ORM decorators do not satisfy TypeScript definite initialization automatically.
- For entity fields hydrated by TypeORM, prefer definite assignment (`!`) for generated identifiers and explicit initializers only when the property truly has an in-memory default.
- Keep import style consistent with nearby files, including `.js` suffixes where this repo already uses them in Nest module imports.
- Treat `src/app.module.ts` as the source of truth for global wiring such as database, cache, and BullMQ configuration.
- Preserve env-driven toggles from `.env` and `.env.example` when adding new configuration.

## Task Routing Guide

- For module ownership and project structure, start with `references/architecture-map.md`.
- For repository, entity, service, and config patterns, read `references/backend-patterns.md`.
- For release-readiness checks, use `references/feature-checklist.md`.

## Output Expectations

- Return concrete file-level changes, not abstract guidance.
- Preserve backward compatibility unless the request explicitly changes behavior.
- Prefer focused validation over broad commands when a narrower check is enough.
- Flag database, env, auth, or integration assumptions immediately.
