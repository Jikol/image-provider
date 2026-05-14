# Image Provider

> Self-hosted HTTP API for uploading, storing, and serving images.

[![CI](https://github.com/Jikol/image-provider/actions/workflows/staging.yml/badge.svg?branch=develop)](https://github.com/Jikol/image-provider/actions/workflows/staging.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Upload single or multiple images (`jpg`, `png`, `gif`, `webp`)
- Serve images statically by name or list all uploaded files
- Delete images by URL or purge all internal uploads in one call
- Configurable upload size limit and storage path
- Interactive docs via [Scalar](https://scalar.com) at `/api/docs`
- OpenAPI spec at `/api/openapi.json`

## Quick Start

**Prerequisites:** [Bun](https://bun.com/docs), [Docker](https://www.docker.com),
[Taskfile](https://taskfile.dev)

```bash
git clone https://github.com/Jikol/image-provider.git
cd image-provider
cp .env.template .env.local   # fill in required variables
task init                     # install dependencies
bun dev                       # start dev server
```

API available at `http://localhost:<IMAGE_PROVIDER_PORT>/api`.

## API

| Method   | Path                             | Description                 |
| -------- | -------------------------------- | --------------------------- |
| `GET`    | `/api/health`                    | Health check                |
| `GET`    | `/api/v1/images`                 | List all uploaded images    |
| `GET`    | `/api/v1/images/:name`           | Serve image by name         |
| `POST`   | `/api/v1/upload`                 | Upload one or more images   |
| `DELETE` | `/api/v1/upload/delete`          | Delete images by URL        |
| `DELETE` | `/api/v1/upload/delete/internal` | Remove all internal uploads |

All responses follow a unified shape:

```json
{
  "context": { "message": "..." },
  "status_message": "OK",
  "status_code": 200
}
```

## Configuration

Copy `.env.template` to `.env.local` and fill in the required values.

| Variable                     | Required | Default | Description                 |
| ---------------------------- | -------- | ------- | --------------------------- |
| `IMAGE_PROVIDER_PORT`        | yes      | —       | HTTP server port            |
| `IMAGE_PROVIDER_UPLOAD_PATH` | yes      | —       | Filesystem path for storage |
| `IMAGE_PROVIDER_UPLOAD_SIZE` | no       | `1024`  | Max upload size in MB       |
| `IMAGE_PROVIDER_DEBUG`       | no       | `true`  | Verbose logging             |

<details>
<summary>Adding a new variable</summary>

1. **`README.md`** — add a row to the table above

2. **`.env.template`** — add an empty entry with a comment:

   ```dotenv
   # <type> [<default>]
   IMAGE_PROVIDER_NEW_VAR=
   ```

3. **`.env.local`** — add with a real value for local development (not committed):

   ```dotenv
   IMAGE_PROVIDER_NEW_VAR=value
   ```

4. **`config.ts`** — add to the Zod `environments` schema:

   ```ts
   IMAGE_PROVIDER_NEW_VAR: z.string();
   ```

5. **`compose.yml`** — add under `environment:` of the service:

   ```yaml
   IMAGE_PROVIDER_NEW_VAR: ${IMAGE_PROVIDER_NEW_VAR:?error}
   ```

6. _(Only if required at Docker build time — e.g. in `EXPOSE` or `HEALTHCHECK`)_
   **`Dockerfile`** — add `ARG` in the relevant stage, **`Taskfile.yml`** — add to
   `requires.vars` and as `--build-arg`, **`.env.ci.template`** — add with environment
   prefix:

   ```dockerfile
   ARG IMAGE_PROVIDER_NEW_VAR
   ```

   ```yaml
   requires:
     vars:
       - IMAGE_PROVIDER_NEW_VAR
   ```

   ```
   --build-arg IMAGE_PROVIDER_NEW_VAR={{.IMAGE_PROVIDER_NEW_VAR}}
   ```

   ```dotenv
   STAGING_IMAGE_PROVIDER_NEW_VAR=
   PRODUCTION_IMAGE_PROVIDER_NEW_VAR=
   ```

</details>

## Development

```bash
bun run dev          # dev server with hot reload
bun run test         # run tests
bun run lint     # typecheck + eslint --fix
bun run form     # prettier --write
```

### Docker

```bash
task docker:dev                                    # local dev via Docker Compose
task docker:build [-- push] [DOCKER_TAG=x.y.z]    # build image
task docker:compose [-- pull] [-- attach|down]     # run production image
```

## Project Structure

```
image-provider/
├── src/
│   ├── app.ts          # Bun.serve bootstrap + graceful shutdown
│   ├── core/           # Routing, middleware, response factories
│   ├── http/           # Domain handlers (images.ts, upload.ts)
│   └── utils.ts        # Shared utilities
├── scripts/            # Build scripts
├── config.ts           # Zod-validated environment configuration
├── logger.ts           # Pino logger instance
├── compose.yml         # Docker Compose definitions
├── Dockerfile          # Multi-stage build (base → test → build → final)
└── Taskfile.yml        # Project automation
```

<details>
<summary>CI/CD — GitHub Actions setup</summary>

The staging pipeline runs on push to `develop`. Defined in `.env.ci.template`.

**Repository variables** (Settings → Secrets and variables → Actions → Variables) use
`STAGING_` / `PRODUCTION_` prefix — a single `export-vars` composite action strips the
prefix per environment:

| Variable                         | Description                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| `STAGING_IMAGE_PROVIDER_PORT`    | HTTP port for the staging container                          |
| `PRODUCTION_IMAGE_PROVIDER_PORT` | HTTP port for the production container                       |
| `CI_DOCKER_REGISTRY`             | Docker registry hostname                                     |
| `CI_DOCKER_IMAGE`                | Docker image name                                            |
| `CI_DEPLOY_HOSTNAME`             | VPS hostname for the deployment URL                          |
| `CI_DOCKER_NAME`                 | Docker Compose project name prefix (`staging`, `production`) |
| `CI_DOCKER_USERNAME`             | Docker registry login                                        |
| `CI_SSH_HOSTNAME`                | VPS SSH host                                                 |
| `CI_SSH_USERNAME`                | VPS SSH user                                                 |

**Environment secrets** (Settings → Environments → `staging` / `production`):

| Secret               | Description                  |
| -------------------- | ---------------------------- |
| `CI_DOCKER_PASSWORD` | Docker registry password     |
| `CI_SSH_PRIVATE_KEY` | PEM private key for SSH auth |

</details>

## License

[MIT](LICENSE)
