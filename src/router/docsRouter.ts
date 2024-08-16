import express, { Router } from "express";
import path from "path";

import logger from "@/logger";
import { reqUrl } from "@/utils";

const docsRouter: Router = express.Router();
const docsPaths = {
  docs: "/docs"
};

/** Static files middleware */
docsRouter.use(
  docsPaths.docs,
  (req, _req, next) => {
    logger.info(`Endpoint accesed (${reqUrl(req)})`);
    next();
  },
  express.static(path.join(process.cwd(), "docs", "openapi.json"))
);

export { docsRouter, docsPaths };
