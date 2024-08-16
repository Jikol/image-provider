import { json, urlencoded } from "body-parser";
import { execFileSync } from "child_process";
import cors from "cors";
import express from "express";
import type { Express } from "express";

import config from "@/config";
import logger from "@/logger";
import { error, notFound, response } from "@/middleware";
import { docsRouter } from "@/router";
import { versionedRouters } from "@/routers";

const app: Express = express();

/** Add helper middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(response);
app.use(cors());

/** Register routers */
app.use(versionedRouters);
app.use(docsRouter);

/** Add error middleware */
app.use(error);
app.use(notFound);

/** Start express server & bind after start events */
app.listen(config.NODE_PORT, () => {
  logger.info("Express started");
  logger.info(`Listening on port ${config.NODE_PORT}`);
  try {
    execFileSync("ts-node", ["src/scripts/generateDocs.ts"], { stdio: "inherit" });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
});
