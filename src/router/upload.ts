import express from "express";
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import type { Multer, StorageEngine } from "multer";
import path from "path";
import serveIndex from "serve-index";
import { v4 } from "uuid";

import config from "@/config";
import logger from "@/logger";

const upload: Router = express.Router();
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb): void => {
    if (!fs.existsSync(config.UPLOAD_DIR)) {
      fs.mkdirSync(config.UPLOAD_DIR);
    }

    return cb(null, config.UPLOAD_DIR);
  },
  filename(_req, file, cb): void {
    return cb(
      null,
      `${v4().substring(0, 9)}${Date.now()}${path
        .extname(file.originalname)
        .toLowerCase()}`
    );
  }
});
const fileUpload: Multer = multer({
  storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter: (_req, file, cb): void => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;

    if (
      allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(null, false);
  }
});

upload.post("/upload", fileUpload.single("file"), (req, res) => {
  if (!req.file) {
    logger.warn("Uploaded file format is not supported");

    return res.unsupportedMedia({
      context: {
        allowedContentType: "multipart/form-data",
        expectedFormId: "file"
      },
      message: "Only image file types are allowed"
    });
  }

  logger.info(
    `File ${req.file.originalname} uploaded to ${req.file.destination} as ${req.file.filename}`
  );

  return res.success({
    context: {
      imageUrl: `${req.protocol}://${req.get("host")}${req.baseUrl}/images/${
        req.file.filename
      }`
    },
    message: "File uploaded successfully"
  });
});

upload.use(
  "/images",
  express.static(config.UPLOAD_DIR),
  serveIndex(config.UPLOAD_DIR, { icons: true })
);

export { upload };
