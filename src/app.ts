import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import process from "process";

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
if (!fs.existsSync(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH)) {
  fs.mkdirSync(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH, { recursive: true });
}

/** Add helper middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(responseMiddleware);

/** Register routers */
app.use(infoRouters);
app.use(versionedRouters);

/** Add error middleware */
app.use(notFoundMiddleware);
app.use(errorMiddleware);

/** Start express server & bind after start events */
const createServer = {
  https: (): https.Server =>
    https.createServer(
      {
        key: fs.readFileSync(config.ENVS.IMAGE_PROVIDER_SSL_KEY_PATH, "utf8"),
        cert: fs.readFileSync(config.ENVS.IMAGE_PROVIDER_SSL_CERT_PATH, "utf8")
      },
      app
    ),
  http: (): http.Server => http.createServer(app)
};
const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
const server = createServer[protocol]();

server.listen(config.ENVS.IMAGE_PROVIDER_PORT, () => {
  log.info(`Express started with '${protocol}' protocol`);
  log.info(`Listening on port ${config.ENVS.IMAGE_PROVIDER_PORT}`);
});

/** Shutdown handling */
const handleExit = (
  server: http.Server | https.Server,
  err: Error | undefined = undefined
): void => {
  if (err) {
    log.error("Runtime error occurred:", err);
    process.exitCode = 1;
  }

  log.info("Received shutdown signal. Closing server...");

  server.close((err: Error | undefined) => {
    if (err) {
      log.error("Error during server shutdown:", err);
      process.exitCode = 1;
    } else {
      log.info("The server has shut down gracefully.");
    }

    process.exit();
  });
};

process.on("SIGINT", () => handleExit(server));
process.on("SIGTERM", () => handleExit(server));
process.on("uncaughtException", (err: Error) => handleExit(server, err));
