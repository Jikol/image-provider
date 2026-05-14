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
task docker:dev  [DOCKER_NAME=<string>] [DOCKER_REGISTRY=<string>]  # local dev via docker compose (alias: task d:d)
task docker:build [-- push] [DOCKER_TARGET=test|final] [DOCKER_TAG=x.y.z]  # build image (alias: task d:b)
task docker:compose [-- pull] [-- attach|down] [DOCKER_NAME=<string>]  # run built image (alias: task d:c)
```

## Architecture

**Runtime:** Bun. **Framework:** Hono.

**Path aliases** (tsconfig):

- `@/*` → `./src/*`
- `/*` → `./*` (root-level — for `config.ts`, `logger.ts`)

**Root-level globals:**

- `config.ts` — Zod-validated env vars, exported as `{ CONST, ENVS }`.
  - `CONST`: `ROOT_PATH`, `API_BASE_PATH`, `ALLOWED_EXT`, `ALLOWED_MIME`
  - `ENVS`: validated env vars (see below)
- `logger.ts` — pino + pino-pretty, exports `default log` + named child `honoLog`

**`src/` layout:**

```
src/app.ts           — Bun.serve bootstrap + graceful shutdown
src/core/
  helpers.ts         — createRouter(), createJsonResponse(), createDocs(), resolveRequestOrigin()
  middlewares.ts     — docsMiddleware, methodNotAllowedMiddleware, notFoundMiddleware, errorMiddleware
  responses.ts       — typed response factories (successResponse, errorResponse, …)
  routers.ts         — route wiring: info + docs (Scalar/OpenAPI) + versioned routes
  schemas.ts         — shared Zod schemas (generalResponseSchema)
src/http/            — domain handlers, one file per resource
  images.ts          — GET /v1/images, GET /v1/images/:imageName
  upload.ts          — POST /v1/upload, DELETE /v1/upload/delete, DELETE /v1/upload/delete/internal
src/utils.ts         — resolveMatchesRoute()
scripts/build.ts     — Bun build script (run via bun run prod)
```

**Response shape** — all JSON responses follow `generalResponseSchema`:

```ts
{ context: { message?, docs? }, status_message: string, status_code: number }
```

**Adding a new HTTP resource:**

1. Create `src/http/<resource>.ts` — define router via `createRouter()`, add routes with
   `describeRoute` + `createDocs()`
2. Register in `src/core/routers.ts` under `versionedRouter`

**`createRouter(paths, basePath?)`** — returns `Hono` with `.paths` and `.base` properties
attached; use `.paths.<key>` for all route strings to stay type-safe.

**`createJsonResponse(statusCode, getHeaders?)`** — returns a response factory with
`.statusCode` and `.schema` attached; pass these factories to `createDocs()` to
auto-generate OpenAPI docs.

**Env vars** (required unless defaulted): `IMAGE_PROVIDER_PORT`,
`IMAGE_PROVIDER_UPLOAD_PATH`, `IMAGE_PROVIDER_UPLOAD_SIZE` (default 1024 MB),
`IMAGE_PROVIDER_DEBUG` (default true). See `.env.template`.
