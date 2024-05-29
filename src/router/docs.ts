import express, { Router } from "express";
import path from "path";

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
  express.static(path.join(process.cwd(), "docs", "openapi.json"))
);

export { docs };
