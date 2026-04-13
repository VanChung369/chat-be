# Architecture Map

## Top-Level Modules

- `src/app.module.ts`: global composition root. Wires TypeORM, BullMQ, cache/redis, and feature modules.
- `src/auth/*`: authentication, guards, verification, session serializer, and auth-facing controller/service flows.
- `src/users/*`: user lookup, creation, profile update flows, and user-facing controllers.
- `src/peer/*`: peer persistence module and repository/service boundary.
- `src/mail/*`: mail sending module/service.
- `src/image-storage/*`: upload controller/service used by profile flows.
- `src/common/*`: shared entities, repository base class, migrations, decorators, and common types/utilities.

## Persistence Shape

- Entities live in `src/common/entities/*`.
- TypeORM root config loads entities via glob and also enables `autoLoadEntities`.
- Shared CRUD helpers live in `src/common/repositories/base.repository.ts`.
- Feature repositories extend `BaseRepository` and add feature-specific query methods.

## Users Flow

- `users/user.module.ts` owns `User`, `Profile`, `Peer`, and `UserPresence` entity registration for user-facing flows.
- `users/controller/user.controller.ts` and `users/controller/user-profile.controller.ts` are HTTP entrypoints.
- `users/service/user.service.ts` handles user creation, lookup, search, verification, and password updates.
- `users/service/user-profile.service.ts` handles profile creation/update and image upload orchestration.
- `users/repository/user.repository.ts` owns user-specific query-builder logic.

## Auth Flow

- `auth/auth.module.ts` imports `UserModule` and `MailModule`.
- Guards/strategy/serializer live under `auth/guards/*`.
- Auth services coordinate login, verification, and session behavior.

## Configuration Flow

- `.env` is loaded in `src/app.module.ts` when present.
- Database behavior is controlled by `DATABASE_URL`, `DB_SYNCHRONIZE`, `DB_LOGGING`, and `DB_SSL`.
- Redis/BullMQ use `REDIS_HOST` and `REDIS_PORT`.
