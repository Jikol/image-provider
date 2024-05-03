import express, { Router } from "express";
import fs from "fs";
import serveIndex from "serve-index";

import config from "@/config";
import { reqUrl } from "@/helper";
import logger from "@/logger";

const images: Router = express.Router();

/** Static files middleware */
images.use(
  "/images",
  (req, _res, next) => {
    logger.info(`Endpoint accesed (${reqUrl(req)})`);
    next();
  },
  express.static(config.UPLOAD_DIR),
  (_req, _res, next) => {
    if (!fs.existsSync(config.UPLOAD_DIR)) {
      fs.mkdirSync(config.UPLOAD_DIR);
    }
    next();
  },
  serveIndex(config.UPLOAD_DIR, {
    icons: true,
    view: "details"
  })
);

export { images };
