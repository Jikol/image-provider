import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import fs from "fs";

import { error, notFound, response } from "@/middleware";
import { docsRouter, healthRouter } from "@/router";
import { versionedRouters } from "@/routers";

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
app.use(response);
app.use(cors());

/** Register routers */
app.use(versionedRouters);
app.use(docsRouter);
app.use(healthRouter);

/** Add error middleware */
app.use(error);
app.use(notFound);

/** Start express server & bind after start events */
app.listen(config.IMAGE_PROVIDER_PORT, () => {
  log.info("Express started");
  log.info(`Listening on port ${config.IMAGE_PROVIDER_PORT}`);
});
