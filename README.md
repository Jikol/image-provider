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

- Use English language only
- Use Conventional Commits messages
- Use Semantic Versioning

### Commit messages

All commit messages should be subject to
the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification according to the
following structure:

```
<type>[<optional scope>]: <description>

<optional body>

<optional footer(s)>
```

All text in a commit message should be in the **present simple tense** in the **imperative case**.

<table style="width: 100%">
<tr>
<td>
<code>feat</code>
<br>
<code>fix</code>
<br>
<code>refactor</code>
<br>
<code>ci</code>
<br>
<code>test</code>
<br>
<code>docs</code>
<br>
<code>chore</code>
</td>
<td>
<span style="display: inline-flex; height: 23px;">when adds or remove a new feature</span>
<br>
<span style="display: inline-flex; height: 23px;">when fixes a bug</span>
<br>
<span style="display: inline-flex; height: 23px;">when rewrite your code which not affect functionality</span>
<br>
<span style="display: inline-flex; height: 23px;">when modify pipeline jobs</span>
<br>
<span style="display: inline-flex; height: 23px;">when ass missing test or correcting existing test</span>
<br>
<span style="display: inline-flex; height: 23px;">when modify documentation only</span>
<br>
<span style="display: inline-flex; height: 23px;">when none of above types suits your intent</span>
</td>
</tr>
</table>


