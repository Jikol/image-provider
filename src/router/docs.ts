import express, { Router } from "express";
import path from "path";

import config from "@/config";
import { reqUrl } from "@/helper";
import logger from "@/logger";

const docs: Router = express.Router();

/** Static files middleware */
docs.use(
  "/docs",
  (req, _req, next) => {
    logger.info(`Endpoint accesed (${reqUrl(req)})`);
    next();
  },
  express.static(path.join(config.APISCHEMA_DIR, "openapi.json"))
);
docs.post("/test", (req, res) => {
  res.send("Hello World!");
});

export { docs };
