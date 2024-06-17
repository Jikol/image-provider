import { file } from "@babel/types";
import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer, { MulterError } from "multer";
import type { Multer, StorageEngine } from "multer";
import path from "path";
import { v4 } from "uuid";
import { z } from "zod";

import config from "@/config";
import { UploadError } from "@/helper";
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
  filename(req, file, cb): void {
    let fileName = `${v4().substring(0, 9)}${Date.now()}${path
      .extname(file.originalname)
      .toLowerCase()}`;

    if (req.query?.data_private && req.query?.data_private === "true") {
      fileName = `_${fileName}`;
    }

    return cb(null, fileName);
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

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Upload images
 *     description: Upload images to the server.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The file(s) to upload.
 *     responses:
 *       '200':
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 context:
 *                   type: object
 *                   properties:
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: URLs of the uploaded images.
 *                 message:
 *                   type: string
 *                   description: A message describing the result of the upload.
 *                 code:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *             example:
 *               context:
 *                 imageUrls:
 *                   - "http://localhost:8000/api/v1/images/<imgId>.<imgExtension>"
 *               message: "File Uploaded Successfully"
 *               code: 200
 *       '400':
 *         description: Bad Request.
 *       '413':
 *         description: Payload too large. The uploaded file exceeds the specified limit.
 *       '415':
 *         description: Unsupported Media Type. The uploaded file format is not supported.
 *       '500':
 *         description: Internal Server Error.
 */
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
          (file) => `${reqBaseUrl(req, 1)}/images/${file.filename}`
        )}] (${reqUrl(req)})`
      );
    });

    return res.success({
      context: {
        imageUrls: (req.files as Array<Express.Multer.File>).map(
          (file) => `${reqBaseUrl(req, 1)}/images/${file.filename}`
        )
      },
      message: "File Uploaded Successfully"
    });
  }
);

const requestSchema = z.object({
  imageUrls: z.array(z.string().url())
});

/**
 * @openapi
 * /upload/delete:
 *   delete:
 *     summary: Remove uploaded images
 *     description: Remove files from filesystem which were uploaded.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs of images to remove.
 *     responses:
 *       '200':
 *         description: Provided URLs file representation has been deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 context:
 *                   type: object
 *                   properties:
 *                     removedImageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: URLs of the remove images.
 *                 message:
 *                   type: string
 *                   description: Provided URLs has been deleted.
 *                 code:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *             example:
 *               context:
 *                 removedImageUrls:
 *                   - "http://localhost:8000/api/v1/images/<imgId>.<imgExtension>"
 *               message: "Provided URLs has been deleted"
 *               code: 200
 *       '400':
 *         description: Bad Request.
 *       '415':
 *         description: Unsupported Media Type. The uploaded file format is not supported.
 *       '500':
 *         description: Internal Server Error.
 */
upload.all(
  "/upload/delete",
  request(["DELETE"], "application/json", requestSchema),
  (req, res) => {
    const { imageUrls } = req.body as z.infer<typeof requestSchema>;

    let alreadyDeleted = true;
    const deletedUrls: Array<string> = [];

    try {
      imageUrls.forEach((imageUrl) => {
        const imagePath = path.resolve(
          config.UPLOAD_DIR,
          imageUrl.substring(imageUrl.lastIndexOf("/") + 1)
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          deletedUrls.push(imageUrl);
          alreadyDeleted = false;
        }
      });
    } catch (err) {
      logger.error(err);

      return res.error({
        message: "Error while perform i/o operations"
      });
    }

    if (alreadyDeleted) {
      return res.success({
        message: "Provided URLs has its file representation already deleted"
      });
    } else {
      return res.success({
        context: {
          removedImageUrls: deletedUrls
        },
        message: "Provided URLs has been deleted"
      });
    }
  }
);

/**
 * @openapi
 * /upload/delete/private:
 *   delete:
 *     summary: Remove uploaded images from data migration process
 *     description: Removes all images that were uploaded during the data migration operation.
 *     responses:
 *       '200':
 *         description: All private images has been deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: All private images has been deleted.
 *                 code:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *             example:
 *               message: "All private images has been deleted"
 *               code: 200
 *       '400':
 *         description: Bad Request.
 *       '500':
 *         description: Internal Server Error.
 */
upload.all("/upload/delete/private", request(["DELETE"]), (req, res) => {
  try {
    const files = fs.readdirSync(path.resolve(config.UPLOAD_DIR));

    files
      .filter((item) => item.startsWith("_"))
      .forEach((fileName) => {
        const filePath = path.join(config.UPLOAD_DIR, fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
  } catch (err) {
    logger.error(err);

    return res.error({
      message: "Error while perform i/o operations"
    });
  }

  return res.success({
    message: "All private images has been deleted"
  });
});

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
