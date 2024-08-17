import express, { Router } from "express";
import fs from "fs";
import serveIndex from "serve-index";

import config from "@/config";
import log from "@/logger";
import { reqUrl } from "@/utils";

const imagesV1Router: Router = express.Router();
const imagesV1Paths = {
  images: "/v1/images"
};

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
imagesV1Router.use(
  imagesV1Paths.images,
  (req, _res, next) => {
    log.info(`Endpoint accesed (${reqUrl(req)})`);
    next();
  },
  express.static(config.NODE_UPLOAD_PATH),
  (_req, _res, next) => {
    if (!fs.existsSync(config.NODE_UPLOAD_PATH)) {
      fs.mkdirSync(config.NODE_UPLOAD_PATH);
    }
    next();
  },
  serveIndex(config.NODE_UPLOAD_PATH, {
    icons: true,
    view: "details"
  })
);

export { imagesV1Router, imagesV1Paths };
