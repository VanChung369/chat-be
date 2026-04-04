# Always use the local `chat-be` skill for this repo

For any request that touches this workspace's backend code, default to the local skill at `skills/chat-be/SKILL.md` even if the user does not explicitly mention `$chat-be`.

Treat the `chat-be` skill as the baseline workflow for NestJS modules, controllers, services, repositories, TypeORM entities, auth flows, configuration, and backend refactors in this repository.
