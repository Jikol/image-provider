import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import type { Express } from "express";

import config from "@/config";
import { generateDocs } from "@/docs";
import logger from "@/logger";
import { error, notFound, response } from "@/middleware";
import { docs, images, upload } from "@/router";

const app: Express = express();

/** Add helper middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(response);
app.use(cors());

/** Register routers */
app.use(config.BASE_PATH, upload);
app.use(config.BASE_PATH, images);
app.use(config.BASE_PATH, docs);

/** Add error middleware */
app.use(error);
app.use(notFound);

/** Start express server & bind after start events */
app.listen(config.PORT, () => {
  logger.info("Express started");
  logger.info("Listening on port 8000");
  generateDocs();
});
