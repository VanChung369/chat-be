# Feature Checklist

## Use This Checklist

Use this checklist before finalizing backend work in this repository.

## 1) Scope and Design

- Confirm the request path and owning module.
- Confirm whether database schema, session, cache, mail, or upload behavior is affected.
- Identify any env or integration assumptions.

## 2) Implementation Safety

- Reuse existing repository and service boundaries where possible.
- Keep controllers thin and business logic in services.
- Keep TypeORM relation and field changes aligned with nearby entity patterns.
- Update `.env.example` when new env keys are introduced.

## 3) Validation

- Run the smallest meaningful check first.
- Run `npm run build` when typing, DI wiring, module imports, or entities change.
- Run focused tests when behavior changes and tests exist.
- Exercise one failure path mentally or manually for auth, persistence, or validation changes.

## 4) Delivery Quality

- Summarize changed files and behavior impact.
- State what was validated and what remains unvalidated.
- Call out migration, seed, env, or deployment follow-up clearly.
