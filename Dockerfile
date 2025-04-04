# base stage
FROM oven/bun:1.2-alpine AS base

ARG DOCKER_TAG
ARG IMAGE_PROVIDER_PORT
ENV DOCKER_TAG=${DOCKER_TAG}
ENV IMAGE_PROVIDER_PORT=${IMAGE_PROVIDER_PORT}

WORKDIR /app

COPY package.json bun.lock ./

RUN apk add --no-cache --update nodejs && \
    bun install --frozen-lockfile --no-save

# linting stage
FROM base AS lint

COPY . .

RUN bun run docs && \
    bun run lint

# build stage
FROM base AS build

COPY . .

RUN apk add --no-cache --update jq && \
    bun run docs && \
    bun run prod && \
    jq --arg DOCKER_TAG "${DOCKER_TAG}" 'walk(if type == "string" then gsub("{{VERSION}}"; $DOCKER_TAG) else . end)' \
      dist/docs/openapi.json > dist/docs/openapi.tmp.json && \
    mv dist/docs/openapi.tmp.json dist/docs/openapi.json && \
    sed -i "s/{{VERSION}}/${DOCKER_TAG}/g" dist/static/redoc.html

# prod stage
FROM alpine:3.19 AS final

WORKDIR /app

EXPOSE ${IMAGE_PROVIDER_PORT}

RUN apk add --no-cache --update nodejs curl

COPY --from=build /app/dist/. .

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD /bin/sh -c "curl --silent --fail --insecure https://localhost:${IMAGE_PROVIDER_PORT}/health || exit 1"

CMD ["node", "index.js"]

# meta additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.version="${DOCKER_TAG}"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["sleep", "infinity"]




