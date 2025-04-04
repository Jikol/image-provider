# Image Provider

[![license](https://img.shields.io/badge/License-MIT-coral)](https://opensource.org/license/mit)
[![pipeline](https://gitlab.vsb.cz/retina/image-provider/badges/develop/pipeline.svg)](https://gitlab.vsb.cz/retina/image-provider/-/pipelines)
[![release](https://gitlab.vsb.cz/retina/image-provider/-/badges/release.svg)](https://gitlab.vsb.cz/retina/image-provider/-/releases)
[![docker](https://img.shields.io/badge/Docker_Registry-retina%2Fimage--provider-dodgerblue)](https://gallery.ecr.aws/k7u6f6n6/retina/image-provider)

> API service used to upload image files that can then be served using their URL. \
> Primarily used for the Retina API.

## Overview

[API Documentation](https://retina.jikol.dev:2053/api/redoc)

### Tech Stack

| **Server**                                                                                                                       | **Docs**                                                                                                                                              |
|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| [![nodejs](https://img.shields.io/badge/_-_?style=flat-square&logo=nodedotjs&label=Node.js&color=5fa04e)](https://nodejs.org/en) | [![redocly](https://img.shields.io/badge/_-_?style=flat-square&logo=readthedocs&label=Redocly&color=8ca1af)](https://redocly.com/)                    |
| [![express](https://img.shields.io/badge/_-_?style=flat-square&logo=express&label=Express&color=000000)](https://expressjs.com/) | [![openapi](https://img.shields.io/badge/_-_?style=flat-square&logo=openapiinitiative&label=OpenAPI&color=6BA539)](https://swagger.io/specification/) |

## Development

**Required programs**

[![taskfile](https://img.shields.io/badge/_-_?style=flat-square&logo=yaml&label=Taskfile&color=94dfd8)](https://taskfile.dev/installation/)
[![bun](https://img.shields.io/badge/_-_?style=flat-square&logo=bun&label=Bun&color=fbf0df)](https://bun.sh/)
[![nodejs](https://img.shields.io/badge/_-_?style=flat-square&logo=nodedotjs&label=Node.js&color=5fa04e)](https://nodejs.org/en)
[![git](https://img.shields.io/badge/_-_?style=flat-square&logo=git&label=Git&color=f05032)](https://git-scm.com/)

### Instructions

Clone the project and checkout to develop branch

```bash
  git clone https://gitlab.vsb.cz/retina/image-provider.git
  cd image-provider && git checkout origin/develop
```

Install JavaScript runtime dependencies

```bash
  task init
```

Create `.env.local` file from `template.env` and fill the desired variables

Now you can start Node.js `express` server in `nodemon` runtime

```bash
  bun dev
```

You should see development documentation on `https://localhost:$IMAGE_PROVIDER_PORT/api/redoc`

## Conventions

- [General](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions)
- [Commit messages](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Commit-messages)
- [Versioning](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Versioning)
- [Docker](https://gitlab.vsb.cz/retina/image-provider/-/wikis/Conventions/Docker)
