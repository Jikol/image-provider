# base stage
FROM oven/bun:1.3.10-alpine AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --no-save

# testing stage
FROM base AS test

COPY . .

RUN bun run lint

# build stage
FROM base AS build

COPY . .

RUN bun run prod

# prod stage
FROM alpine:3.23 AS final

# SERVER ENVS
ARG IMAGE_PROVIDER_PORT

WORKDIR /app

EXPOSE ${IMAGE_PROVIDER_PORT}

RUN apk add --no-cache --update curl libstdc++

COPY --from=build /app/dist/. .

HEALTHCHECK --start-period=10s --interval=7s --timeout=5s --retries=3 \
  CMD curl --silent --fail http://localhost:${IMAGE_PROVIDER_PORT}/api/health || exit 1

ENTRYPOINT ["./app"]

# for debug purpose only
# ENTRYPOINT ["sleep", "infinity"]


