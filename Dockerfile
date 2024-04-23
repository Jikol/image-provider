ARG VERSION
ARG DATETIME

# base image
FROM node:20.6.1 as base

WORKDIR /app

COPY . .

RUN corepack enable
RUN yarn set version stable
RUN yarn config set nodeLinker node-modules
RUN yarn install
RUN yarn build

# final image
FROM node:alpine3.19

WORKDIR /app

EXPOSE 8000

COPY --from=base /app/dist/index.js .

CMD ["node", "index.js"]

# mata additions
LABEL org.opencontainers.image.title="image-provider"
LABEL org.opencontainers.image.description="Express API for upload and serve retina images"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.created=${DATETIME}
LABEL org.opencontainers.image.vendor="VSB"
LABEL org.opencontainers.image.base.name="node:alpine3.19"

# for debug purpose only
# CMD ["sleep", "infinity"]




