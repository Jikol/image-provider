# base stage
FROM oven/bun:1.1-alpine AS base

ARG VERSION
ARG HOSTNAME

ENV VERSION=${VERSION}
ENV HOSTNAME=${HOSTNAME}

ARG NODE_PORT
ARG REDOC_HOSTNAME
ARG REDOC_PORT

ENV NODE_PORT=${NODE_PORT}
ENV REDOC_HOSTNAME=${REDOC_HOSTNAME}
ENV REDOC_PORT=${REDOC_PORT}

WORKDIR /app

COPY package.json bun.lockb ./

RUN apk add --no-cache --update nodejs
RUN bun install --frozen-lockfile

# linting stage
FROM base AS lint

COPY . .

RUN bun run lint

# build stage
FROM base AS build

COPY . .

RUN bun run build

# prod stage
FROM alpine:3.19 AS prod

WORKDIR /app

EXPOSE ${NODE_PORT}

RUN apk add --no-cache --update nodejs curl

COPY --from=build /app/dist/. .

RUN rm -rf .prettierignore .prettierrc.json .eslintignore .eslintrc.json

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD /bin/sh -c "curl --silent --fail http://localhost:${NODE_PORT}/api/health || exit 1"

CMD ["node", "index.js"]

# meta additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["sleep", "infinity"]




