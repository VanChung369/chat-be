# Backend Patterns

## Modules and DI

- Keep providers in the owning feature module.
- Register entities with `TypeOrmModule.forFeature(...)` in the module that injects them.
- Export services or repositories only when another module truly consumes them.
- Mirror nearby import suffix style; some module files in this repo import sibling modules with `.js` suffixes.

## Repositories

- Extend `BaseRepository` for feature repositories instead of rebuilding CRUD wrappers.
- Add feature-specific query methods in the repository when they are persistence-oriented.
- Keep orchestration and branching in services, not repositories.

## Services

- Keep business logic in services.
- Prefer one service as the orchestration owner for a request flow.
- Reuse existing services such as image storage or mail instead of duplicating adapters.

## Entities and TypeORM

- Keep entities under `src/common/entities`.
- For generated ids and ORM-populated relations, prefer definite assignment (`!`) when strict initialization complains.
- Use explicit property initializers only for real in-memory defaults, not as a workaround for ORM-populated values.
- Add relation updates carefully and verify the owning/inverse side matches nearby entity style.

## Config and Environment

- Keep new env keys documented in `.env.example`.
- Follow existing parsing style in `src/app.module.ts` for boolean and numeric env values.
- Avoid hiding config decisions deep inside services when they belong in app-level wiring.

## Validation

- Prefer `npm run build` or a focused test when DI wiring, types, or module imports change.
- If behavior depends on database or redis, call out what was and was not validated locally.
