# base stage
FROM oven/bun:1.1-alpine as base

ARG NODE_PORT

WORKDIR /app

COPY package.json bun.lockb ./

RUN apk add --no-cache --update nodejs
RUN bun install

# linting stage
FROM base AS lint

COPY . .

RUN bun run lint

# build stage
FROM base AS build

COPY . .

RUN bun run build

# prod stage
FROM alpine:3.19 as prod

WORKDIR /app

EXPOSE ${NODE_PORT}

RUN apk add --no-cache --update nodejs curl

COPY --from=build /app/dist/. .
COPY --from=build /app/docs/. ./docs

RUN rm -rf .prettierignore .prettierrc.json .eslintignore .eslintrc.json

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD ["/bin/sh", "-c", "curl --silent --fail http://localhost:${NODE_PORT}/docs || exit 1"]

CMD ["node", "index.js"]

# meta additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["sleep", "infinity"]




