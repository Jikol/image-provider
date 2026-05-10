# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Commands

```bash
bun dev          # dev server with watch
bun test         # run tests
bun run lint     # tsc + eslint --fix
bun run form     # prettier --write

task init        # install deps (alias: task i)
task docker:dev  # local dev via docker compose (alias: task d:d)
task docker:build [-- push] [DOCKER_TARGET=test|final] [DOCKER_TAG=x.y.z]  # build image (alias: task d:b)
task docker:compose [-- attach|down]  # run built image (alias: task d:c)
```

## Architecture

**Runtime:** Bun. **Framework:** Hono (migrated from Express, old code in `_src/` — ignore
it).

**Path aliases** (tsconfig):

- `@/*` → `./src/*`
- `/*` → `./*` (root-level — for `config.ts`, `logger.ts`)

**Root-level globals:**

- `config.ts` — Zod-validated env vars, exported as `{ CONST, ENVS }`
- `logger.ts` — pino + pino-pretty, exports `default log` + named children (`honoLog`,
  `amqpLog`, `socketLog`)

**`src/` layout:**

```
src/app.ts           — Bun.serve bootstrap + graceful shutdown
src/core/
  helpers.ts         — createRouter(), createJsonResponse(), createDocs(), resolveRequestOrigin()
  middlewares.ts     — docsMiddleware, methodNotAllowedMiddleware, notFoundMiddleware, errorMiddleware
  responses.ts       — typed response factories (successResponse, errorResponse, …)
  routers.ts         — route wiring: info + docs (Scalar/OpenAPI) + versioned routes
  schemas.ts         — shared Zod schemas (generalResponseSchema)
src/http/            — domain handlers, one file per resource (e.g. images.ts)
src/utils.ts         — resolveMatchesRoute()
```

**Response shape** — all JSON responses follow `generalResponseSchema`:

```ts
{ context: { message?, docs? }, status_message: string, status_code: number }
```

**Adding a new HTTP resource:**

1. Create `src/http/<resource>.ts` — define router via `createRouter()`, add routes with
   `describeRoute` + `createDocs()`
2. Register in `src/core/routers.ts` under `versionedRouter`

**`createRouter(paths, basePath?)`** — returns `Hono` with typed `.paths` property
attached; use `.paths.<key>` for all route strings to stay type-safe.

**`createJsonResponse(statusCode, getHeaders?)`** — returns a response factory with
`.statusCode` and `.schema` attached; pass these factories to `createDocs()` to
auto-generate OpenAPI docs.

**Env vars** (required unless defaulted): `IMAGE_PROVIDER_PORT`,
`IMAGE_PROVIDER_UPLOAD_PATH`, `IMAGE_PROVIDER_UPLOAD_SIZE` (default 1024 MB),
`IMAGE_PROVIDER_DEBUG` (default true). See `.env.template`.
