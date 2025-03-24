import express, { Router } from "express";
import path from "path";

import { request } from "@/middleware";

import config from "/config";

const docsRouter: Router = express.Router();
const docsPaths = {
  openapi: path.join(config.API_BASE_PATH, "openapi.json"),
  redoc: path.join(config.API_BASE_PATH, "redoc")
};

/**
 * @openapi
 * /api/openapi.json:
 *   get:
 *     operationId: getOpenapijson
 *     summary: Serve OpenAPI documentation
 *     description: Serves the OpenAPI documentation as a JSON file.
 *     responses:
 *       '200':
 *         description: The OpenAPI documentation in JSON format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: The OpenAPI schema document.
 *       '404':
 *         description: The documentation file was not found.
 *       '500':
 *         description: Internal server error.
 */
docsRouter.use(
  docsPaths.openapi,
  request(["GET"]),
  express.static(path.join(config.ROOT_PATH, "docs", "openapi.json"))
);

/**
 * @openapi
 * /api/redoc:
 *   get:
 *     operationId: getRedoc
 *     summary: Serve ReDoc documentation from OpenAPI schema
 *     description: Serves the ReDoc documentation as static site.
 *     responses:
 *       '200':
 *         description: The ReDoc documentation as static site.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               format: html
 *               description: The static ReDoc documentation.
 *       '404':
 *         description: The documentation static HTML file was not found.
 *       '500':
 *         description: Internal server error.
 */
docsRouter.use(
  docsPaths.redoc,
  request(["GET"]),
  express.static(path.join(config.ROOT_PATH, "static", "redoc.html"))
);

export { docsRouter, docsPaths };
