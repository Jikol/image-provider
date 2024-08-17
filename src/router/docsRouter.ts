import express, { Router } from "express";
import path from "path";

import config from "@/config";
import log from "@/logger";
import { reqUrl } from "@/utils";

const docsRouter: Router = express.Router();
const docsPaths = {
  docs: "/docs"
};

/** Static files middleware */
docsRouter.use(
  docsPaths.docs,
  (req, _req, next) => {
    log.info(`Endpoint accesed (${reqUrl(req)})`);
    next();
  },
  express.static(path.join(config.ROOT_PATH, "docs", "openapi.json"))
);

export { docsRouter, docsPaths };
