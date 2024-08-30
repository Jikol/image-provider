import express, { Router } from "express";
import path from "path";

import config from "@/config";
import { request } from "@/middleware";

const docsRouter: Router = express.Router();
const docsPaths = {
  docs: path.join(config.API_BASE_PATH, "openapi.json")
};

/**
 * @openapi
 * /api/openapi.json:
 *   get:
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
  docsPaths.docs,
  request(["GET"]),
  express.static(path.join(config.ROOT_PATH, "docs", "openapi.json"))
);

export { docsRouter, docsPaths };
