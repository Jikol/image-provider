ARG DATETIME

# base image
FROM node:20.6.1 as base

ARG NODE_VERSION
ARG NODE_DEBUG
ARG NODE_ENV
ARG NODE_HOSTNAME
ARG NODE_PORT
ARG NODE_UPLOAD_DIR
ARG NODE_UPLOAD_SIZE
ARG NODE_REDOC_HOSTNAME
ARG NODE_REDOC_PORT

ENV NODE_VERSION=$NODE_VERSION
ENV NODE_DEBUG=$NODE_DEBUG
ENV NODE_ENV=$NODE_ENV
ENV NODE_HOSTNAME=$NODE_HOSTNAME
ENV NODE_PORT=$NODE_PORT
ENV NODE_UPLOAD_DIR=$NODE_UPLOAD_DIR
ENV NODE_UPLOAD_SIZE=$NODE_UPLOAD_SIZE
ENV NODE_REDOC_HOSTNAME=$NODE_REDOC_HOSTNAME
ENV NODE_REDOC_PORT=$NODE_REDOC_PORT

WORKDIR /app

COPY . .

RUN corepack enable
RUN yarn set version stable
RUN yarn config set nodeLinker node-modules
RUN yarn install
RUN yarn build
RUN yarn docs

# final image
FROM alpine:3.19

WORKDIR /app

EXPOSE 8000

RUN apk add --no-cache --update nodejs

COPY --from=base /app/dist/. .
COPY --from=base /app/docs/. ./docs

CMD ["node", "index.js"]

# mata additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.version=${NODE_VERSION}
LABEL org.opencontainers.image.created=${DATETIME}
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["/bin/sh"]




