import express, { Router } from "express";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";

import { requestHandler } from "@/core";
import { imagesV1Router, uploadV1Router } from "@/http";

import config from "/config";

const versionedRouters: Router = express.Router();

versionedRouters.use(config.CONST.API_BASE_PATH, imagesV1Router);
versionedRouters.use(config.CONST.API_BASE_PATH, uploadV1Router);

const infoRouters: Router = express.Router();
const docsPaths = {
  openapi: path.join(config.CONST.API_BASE_PATH, "/openapi.json"),
  redoc: path.join(config.CONST.API_BASE_PATH, "/redoc")
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
infoRouters.use(docsPaths.openapi, requestHandler(["GET"]), (req, res) => {
  fs.readFile(
    path.join(config.CONST.ROOT_PATH, "docs", "openapi.json"),
    "utf8",
    (err, data) => {
      if (!err) {
        return res.json(
          JSON.parse(
            data
              .replaceAll(
                "{{PROTOCOL}}",
                process.env.NODE_ENV === "development" ? "http" : "https"
              )
              .replaceAll("{{HOST}}", req.get("host") ?? "localhost")
              .replaceAll("{{VERSION}}", process.env.VERSION || "latest")
          )
        );
      }

      if (err.code === "ENOENT") {
        return res.notFound({
          context: {
            message: "The requested openapi file was not found"
          }
        });
      }

      return res.error({
        context: {
          message: err.message
        }
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
infoRouters.use(docsPaths.redoc, requestHandler(["GET"]), (req, res) => {
  fs.readFile(
    path.join(config.CONST.ROOT_PATH, "static", "redoc.html"),
    "utf8",
    (err, data) => {
      if (!err) {
        const parsedHtml = handlebars.compile(data);

        return res.send(
          parsedHtml({
            PROTOCOL: process.env.NODE_ENV === "development" ? "http" : "https",
            HOST: req.get("host") ?? "localhost",
            VERSION: process.env.VERSION || "latest"
          })
        );
      }

      if (err.code === "ENOENT") {
        return res.notFound({
          context: {
            message: "The requested ReDoc HTML file was not found"
          }
        });
      }

      return res.error({
        context: {
          message: err.message
        }
      });
    }
  );
});

/**
 * @openapi
 * /health:
 *   get:
 *     operationId: getHealth
 *     summary: Health Check
 *     description: Checks if the API is up and functional.
 *     responses:
 *       '200':
 *         description: API is up and functional.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API service is up and functional
 *       '400':
 *         description: Bad Request (for internal handling, though it's not really needed).
 *       '500':
 *         description: Internal server error.
 */
infoRouters.all("/health", requestHandler(["GET"]), (_req, res) => {
  res.success({
    context: {
      message: "API service is up and functional"
    }
  });
});

export { versionedRouters, infoRouters, docsPaths };
