import { json, urlencoded } from "body-parser";
import express from "express";
import type { Express } from "express";

import config from "@/config";
import logger from "@/logger";
import { error, notFound, response } from "@/middleware";
import { images, upload } from "@/router";

const app: Express = express();

/** Add helper middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(response);

/** Register routers */
app.use("/api/v1", upload);
app.use("/api/v1", images);

/** Add error middleware */
app.use(error);
app.use(notFound);

/** Start express server */
app.listen(config.PORT, () => {
  logger.info("Express started");
  logger.info("Listening on port 8000");
});
