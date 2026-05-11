# Image Provider

> HTTP API service for image uploading and serving.

## Tech Stack

- **[Bun](https://bun.com/docs)** - Runtime environment
- **[Hono](https://hono.dev)** - HTTP framework
- **[Pino](https://getpino.io)** - Logging
- **[Zod](https://zod.dev)** - Schema validation
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[Docker](https://www.docker.com)** - Containerization

## Development

### Prerequisites

- **[Git](https://git-scm.com)** - Version control
- **[Taskfile](https://taskfile.dev/docs/guide)** - Project automation
- **[Bun](https://bun.com/docs)** - Runtime environment
- **[Docker](https://www.docker.com)** - Container runtime

Clone the project and checkout to develop branch

```bash
git clone <repository-url>
cd image-provider && git checkout origin/develop
```

Create `.env.local` from `.env.template` and fill the desired variables

### Install

```bash
task init
```

### Development

```bash
bun dev
```

### Build

```bash
task docker:build
```

### Additional Commands

#### Bun scripts (`bun run <script>`)

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `bun dev`      | Start dev server with hot reload      |
| `bun test`     | Run test suite                        |
| `bun run lint` | Lint source files and auto-fix issues |
| `bun run form` | Format source files with Prettier     |

#### Taskfile tasks (`task <task>`)

| Command               | Alias | Description                                                                                    |
| --------------------- | ----- | ---------------------------------------------------------------------------------------------- |
| `task init`           | `i`   | Install dependencies (`-- hard` to also delete lockfile)                                       |
| `task docker:dev`     | `d:d` | Start local dev environment via Docker Compose                                                 |
| `task docker:build`   | `d:b` | Build Docker image for deployment (supports `-- push`, `DOCKER_TAG`, `DOCKER_TARGET`)          |
| `task docker:compose` | `d:c` | Run the built production image via Docker Compose (supports `-- pull`, `-- attach`, `-- down`) |

## Project Structure

```
image-provider/
├── src/
│   ├── app.ts          # Bun.serve bootstrap + graceful shutdown
│   ├── core/           # Routing, middleware, response factories
│   ├── http/           # Domain handlers, one file per resource
│   └── utils.ts        # Shared utilities
├── scripts/            # Build scripts
├── types/              # Shared TypeScript type definitions
├── config.ts           # Zod-validated environment configuration
├── logger.ts           # Pino logger instance
├── compose.yml         # Docker Compose service definitions
├── Dockerfile          # Docker image build definition
└── Taskfile.yml        # Project automation tasks
```

## Environment Variables

### Runtime (injected into container via Docker Compose)

| Variable                     | Type      | Default | Description                  |
| ---------------------------- | --------- | ------- | ---------------------------- |
| `IMAGE_PROVIDER_DEBUG`       | `boolean` | `true`  | Enable debug/verbose logging |
| `IMAGE_PROVIDER_PORT`        | `number`  | -       | HTTP server port             |
| `IMAGE_PROVIDER_UPLOAD_PATH` | `string`  | -       | Unix path for image storage  |
| `IMAGE_PROVIDER_UPLOAD_SIZE` | `number`  | `1024`  | Max upload size in MB        |

### CI (GitHub Actions)

Defined in `.env.ci.template` — serves as reference for configuring GitHub Actions variables and secrets.

**Repository variables** (Settings → Secrets and variables → Actions → Variables) use `STAGING_` / `PRODUCTION_` prefix so a single `export-vars` composite action can strip the prefix and expose the correct value for each environment:

| Variable                              | Description                                  |
| ------------------------------------- | -------------------------------------------- |
| `STAGING_IMAGE_PROVIDER_PORT`         | HTTP port exposed by the staging container   |
| `PRODUCTION_IMAGE_PROVIDER_PORT`      | HTTP port exposed by the production container |
| `CI_DOCKER_REGISTRY`                  | Docker registry hostname                     |
| `CI_DOCKER_IMAGE`                     | Docker image name (e.g. `user/repo`)         |
| `CI_DEPLOY_HOSTNAME`                  | VPS hostname used for the deployment URL     |
| `CI_DOCKER_NAME`                      | Docker Compose project name prefix (e.g. `staging`, `production`) |
| `CI_DOCKER_USERNAME`                  | Docker registry login                        |
| `CI_SSH_HOSTNAME`                     | VPS SSH host                                 |
| `CI_SSH_USERNAME`                     | VPS SSH user                                 |

**Environment secrets** (Settings → Environments → `staging` / `production`) are scoped per environment and have no prefix:

| Secret                | Description                  |
| --------------------- | ---------------------------- |
| `CI_DOCKER_PASSWORD`  | Docker registry password     |
| `CI_SSH_PRIVATE_KEY`  | PEM private key for SSH auth |

### Adding a new variable

1. **`README.md`** — add a row to the environment variables table above

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
   IMAGE_PROVIDER_NEW_VAR: z.string()
   ```

5. **`compose.yml`** — add under `environment:` of the service:

   ```yaml
   IMAGE_PROVIDER_NEW_VAR: ${IMAGE_PROVIDER_NEW_VAR:?error}
   ```

6. _(Only if the variable is required at Docker build time — e.g. in `EXPOSE` or `HEALTHCHECK`)_
   **`Dockerfile`** — add `ARG` in the relevant stage, **`Taskfile.yml`** — add to `requires.vars`
   and as `--build-arg`, and **`.env.ci.template`** — add with environment prefix:

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
