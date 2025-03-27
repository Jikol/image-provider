import express, { Router } from "express";
import fs from "fs";
import handlebars from "handlebars";
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
docsRouter.use(docsPaths.openapi, request(["GET"]), (req, res) => {
  fs.readFile(
    path.join(config.ROOT_PATH, "docs", "openapi.json"),
    "utf8",
    (err, data) => {
      if (!err) {
        return res.json(
          JSON.parse(
            data
              .replaceAll("{{HOST}}", req.get("host") ?? "localhost")
              .replaceAll("{{VERSION}}", "latest")
          )
        );
      }

      if (err.code === "ENOENT") {
        return res.notFound({
          message: "The requested openapi file was not found"
        });
      }

      return res.error({
        message: err.message
      });
    }
  );
});

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
docsRouter.use(docsPaths.redoc, request(["GET"]), (req, res) => {
  fs.readFile(
    path.join(config.ROOT_PATH, "static", "redoc.html"),
    "utf8",
    (err, data) => {
      if (!err) {
        const parsedHtml = handlebars.compile(data);

        return res.send(
          parsedHtml({ HOST: req.get("host") ?? "localhost", VERSION: "latest" })
        );
      }

      if (err.code === "ENOENT") {
        return res.notFound({
          message: "The requested ReDoc HTML file was not found"
        });
      }

      return res.error({
        message: err.message
      });
    }
  );
});

export { docsRouter, docsPaths };
