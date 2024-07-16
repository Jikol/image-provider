# Image Provider

[![license](https://img.shields.io/badge/License-MIT-blue)](https://opensource.org/license/mit)
[![pipeline](https://gitlab.vsb.cz/retina/image-provider/badges/develop/pipeline.svg)](https://gitlab.vsb.cz/retina/image-provider/-/pipelines)
[![release](https://gitlab.vsb.cz/retina/image-provider/-/badges/release.svg)](https://gitlab.vsb.cz/retina/image-provider/-/releases)
[![docker](https://img.shields.io/badge/Docker-jav0032%2Fretina-blue)](https://hub.docker.com/repository/docker/jav0032/retina/general)

> API service used to upload image files that can then be served using their URL. \
> Primarily used for the Retina API.

## Documentation

[API Documentation](http://vsrvfeia0h-86.vsb.cz:8888)

### Tech Stack

- Server: [Node](https://nodejs.org/en), [Express](https://expressjs.com/)
- Docs: [Redocly](https://redocly.com/), [OpenAPI](https://swagger.io/specification/)

## Development

Required programs: [Taskfile](https://taskfile.dev/installation/) • [Bun](https://bun.sh/) • [Node.js](https://nodejs.org/en) • [Git](https://git-scm.com/)

Clone the project from [GitLab - image-provider](https://gitlab.vsb.cz/retina/image-provider/-/tree/develop?ref_type=heads) repository with

```bash
  git clone https://gitlab.vsb.cz/retina/image-provider.git
```

Go to the project directory and install JavaScript runtime dependencies with

```bash
  cd image-provider && task init
```

Create `.env` file from `template.env` file and fill the *Development Environment* section it in as needed.

Run compose for dependent service for development with

```bash
  task docker:dev
```

Now you can start Node.js `express` server in `nodemon` HMR runtime with \
_(it will start docker compose in attach mode)_

```bash
  bun dev
```

You should see Redoc docs on `http://localhost:$NODE_REDOC_PORT/`

## Conventions

- [General](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions)
- [Commit messages](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Commit-messages)
- [Versioning](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Versioning)
- [Docker](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Docker)

