# base stage
FROM oven/bun:1.2-alpine AS base

ARG IMAGE_PROVIDER_PORT
ENV IMAGE_PROVIDER_PORT=${IMAGE_PROVIDER_PORT}

WORKDIR /app

COPY package.json bun.lock ./

RUN apk add --no-cache --update nodejs
RUN bun install --frozen-lockfile --no-save

# linting stage
FROM base AS lint

COPY . .

RUN bun run docs
RUN bun run lint

# build stage
FROM base AS build

COPY . .

RUN bun run docs
RUN bun run prod

# prod stage
FROM alpine:3.19 AS final

WORKDIR /app

EXPOSE ${IMAGE_PROVIDER_PORT}

RUN apk add --no-cache --update nodejs curl

COPY --from=build /app/dist/. .

RUN rm -rf .prettierignore .prettierrc.json .eslintignore .eslintrc.json

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD /bin/sh -c "curl --silent --fail --insecure https://localhost:${IMAGE_PROVIDER_PORT}/api/health || exit 1"

CMD ["node", "index.js"]

# meta additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["sleep", "infinity"]




