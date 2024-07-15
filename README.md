# Image Provider

[![license](https://img.shields.io/badge/License-MIT-blue)](https://opensource.org/license/mit)
[![pipeline](https://gitlab.vsb.cz/retina/image-provider/badges/develop/pipeline.svg)](https://gitlab.vsb.cz/retina/image-provider/-/pipelines)
[![release](https://gitlab.vsb.cz/retina/image-provider/-/badges/release.svg)](https://gitlab.vsb.cz/retina/image-provider/-/releases)
[![docker](https://img.shields.io/badge/Docker-jav0032%2Fretina-blue)](https://hub.docker.com/repository/docker/jav0032/retina/general)

API service used to upload image files that can then be served using their URL. \
Primarily used for the Retina API.

## Documentation

[API Documentation](http://vsrvfeia0h-86.vsb.cz:8888)

## Tech Stack

- Server: [Node](https://nodejs.org/en), [Express](https://expressjs.com/)
- Docs: [Redocly](https://redocly.com/), [OpenAPI](https://swagger.io/specification/)

## Run Locally

Install [Taskfile](https://taskfile.dev/installation/) and [Git](https://git-scm.com/)

Clone the project

```bash
  git clone https://gitlab.vsb.cz/retina/image-provider.git
```

Go to the project directory

```bash
  cd image-provider
```

Install dependencies

```bash
  task init
```

Create `.env` file from `template.env` file and fill the *Development Environment* section it in as needed

Run docker dependencies stack

```bash
  task dev:compose:up
```

Run express server in nodemon

```bash
  yarn dev
```

You should see docs on `http://localhost:$NODE_REDOC_PORT/`

## Conventions

- [Commit messages](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Commit-messages)
- [Versioning](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Versioning)
- [Docker](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Docker)

