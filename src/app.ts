import { json, urlencoded } from "body-parser";
import { execFileSync } from "child_process";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import process from "process";

import config from "@/config";
import log from "@/logger";
import { error, notFound, response } from "@/middleware";
import { docsRouter } from "@/router";
import { versionedRouters } from "@/routers";

const app: Express = express();

/** Output global config */
log.debug(config);

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
  log.info("Express started");
  log.info(`Listening on port ${config.NODE_PORT}`);
  if (process.env.NODE_DEV) {
    try {
      execFileSync("ts-node", ["src/scripts/generateDocs.ts"], { stdio: "inherit" });
    } catch (err) {
      log.error(err);
      process.exit(1);
    }
  }
});
