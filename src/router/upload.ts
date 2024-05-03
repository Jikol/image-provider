import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer, { MulterError } from "multer";
import type { Multer, StorageEngine } from "multer";
import path from "path";
import { v4 } from "uuid";

import config from "@/config";
import { UploadError } from "@/exception";
import { reqUrl } from "@/helper";
import { reqBaseUrl } from "@/helper";
import logger from "@/logger";
import request from "@/middleware";

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
    fileSize: config.UPLOAD_SIZE
  },
  fileFilter: (_req, file, cb): void => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;

    if (
      allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new UploadError("Uploaded file format is not supported", "LIMIT_FILE_TYPE")
    );
  }
});

/** Handle main method */
upload.all(
  "/upload",
  request(["POST"], "multipart/form-data"),
  fileUpload.array("file"),
  (req, res) => {
    if ((req.files as Array<Express.Multer.File>).length <= 0) {
      return res.badRequest({
        context: {
          message: "Files have not been provided"
        }
      });
    }

    (req.files as Array<Express.Multer.File>).forEach((file) => {
      logger.info(
        `File ${file.originalname} uploaded to ${file.destination} as ${
          file.filename
        } as [${(req.files as Array<Express.Multer.File>).map(
          (file) => `${reqBaseUrl(req)}/images/${file.filename}`
        )}] (${reqUrl(req)})`
      );
    });

    return res.success({
      context: {
        imageUrls: (req.files as Array<Express.Multer.File>).map(
          (file) => `${reqBaseUrl(req)}/images/${file.filename}`
        )
      },
      message: "File Uploaded Successfully"
    });
  }
);

/** Error handling */
upload.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError || err instanceof UploadError) {
    if ((err as MulterError).code === "LIMIT_FILE_SIZE") {
      logger.warn(`${err.message} [${reqUrl(req)}]`);

      return res.tooLarge({
        context: {
          message: err.message,
          maxFileSize: `${config.UPLOAD_SIZE / 1000} kB`
        }
      });
    }
    if ((err as MulterError).code === "LIMIT_UNEXPECTED_FILE") {
      logger.warn(`${err.message} [${reqUrl(req)}]`);

      return res.badRequest({
        context: {
          message: err.message,
          expectedFormId: "file"
        }
      });
    }
    if ((err as UploadError).code === "LIMIT_FILE_TYPE") {
      logger.warn(`${err.message} [${reqUrl(req)}]`);

      return res.unsupportedMedia({
        context: {
          message: err.message,
          allowedMimeTypes: ["jpg", "png", "gif", "webp"],
          expectedFormId: "file"
        }
      });
    }
  }

  next(err);
});

export { upload };
