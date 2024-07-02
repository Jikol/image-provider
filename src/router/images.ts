import express, { Router } from "express";
import fs from "fs";
import serveIndex from "serve-index";

import config from "@/config";
import { reqUrl } from "@/helper";
import logger from "@/logger";

const imagesV1: Router = express.Router();

/** Static files middleware */
/**
 * @openapi
 * /v1/images:
 *   get:
 *     summary: List uploaded images
 *     description: Retrieve images index listing from the server.
 *     responses:
 *       '200':
 *         description: Image listing retrieved successfully.
 *       '404':
 *         description: Image listing directory not found.
 * /v1/images/{imageName}:
 *   get:
 *     summary: Get a static image by name
 *     description: Retrieve a specific static image from the server by its name.
 *     parameters:
 *       - in: path
 *         name: imageName
 *         required: true
 *         description: The name of the image file to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Static image retrieved successfully.
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Static image not found.
 */
imagesV1.use(
  "/v1/images",
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

export { imagesV1 };
