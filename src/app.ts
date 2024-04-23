import { json, urlencoded } from "body-parser";
import express from "express";
import type { Express } from "express";

import config from "@/config";
import logger from "@/logger";
import { responseMiddleware } from "@/response";
import { upload } from "@/router";

const app: Express = express();

/** Add middleware */
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(responseMiddleware);

/** Register routers */
app.use("/api/v1", upload);
app.use((req, res) => {
  return res.status(404).jsonp({
    message: `path ${req.path} not found`,
    availablePaths: upload.stack.map(({ route }) => {
      return { name: route.path, methods: route.methods };
    })
  });
});

/** Start express server */
app.listen(config.PORT, () => {
  logger.info("Express started");
  logger.info("Listening on port 8000");
});
