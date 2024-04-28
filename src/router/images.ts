import express, { Router } from "express";
import serveIndex from "serve-index";

import config from "@/config";

const route = "/images";
const images: Router = express.Router();

/** Static files middleware */
images.use(
  route,
  express.static(config.UPLOAD_DIR),
  serveIndex(config.UPLOAD_DIR, { icons: true })
);

export { images };
