import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import fs from "fs";
import https from "https";

import {
  errorMiddleware,
  infoRouters,
  notFoundMiddleware,
  responseMiddleware,
  versionedRouters
} from "@/core";

import config from "/config";
import log from "/logger";

const app: Express = express();

/** Output global config */
log.debug(config);

/** Preparation of required system locations */
if (!fs.existsSync(config.IMAGE_PROVIDER_UPLOAD_PATH)) {
  fs.mkdirSync(config.IMAGE_PROVIDER_UPLOAD_PATH, { recursive: true });
}

/** Add helper middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(responseMiddleware);

/** Register routers */
app.use(infoRouters);
app.use(versionedRouters);

/** Add errorHandler middleware */
app.use(notFoundMiddleware);
app.use(errorMiddleware);

/** Start express server & bind after start events */
const server = https.createServer(
  {
    key: fs.readFileSync(config.IMAGE_PROVIDER_SSL_KEY_PATH, "utf8"),
    cert: fs.readFileSync(config.IMAGE_PROVIDER_SSL_CERT_PATH, "utf8")
  },
  app
);

server.listen(config.IMAGE_PROVIDER_PORT, () => {
  log.info("Express started");
  log.info(`Listening on port ${config.IMAGE_PROVIDER_PORT}`);
});
