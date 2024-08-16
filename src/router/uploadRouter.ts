import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer, { MulterError } from "multer";
import type { Multer, StorageEngine } from "multer";
import path from "path";
import { v4 } from "uuid";
import { z } from "zod";

import config from "@/config";
import { UploadError } from "@/helpers";
import logger from "@/logger";
import { request } from "@/middleware";
import { imagesV1Paths } from "@/router";
import { apiUrl, reqUrl } from "@/utils";

const uploadV1Router: Router = express.Router();
const uploadV1Paths = {
  upload: "/v1/upload",
  delete: "/v1/upload/delete",
  deletePrivate: "/v1/upload/delete/private"
};

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb): void => {
    if (!fs.existsSync(config.NODE_UPLOAD_DIR)) {
      fs.mkdirSync(config.NODE_UPLOAD_DIR);
    }

    return cb(null, config.NODE_UPLOAD_DIR);
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
    fileSize: config.NODE_UPLOAD_SIZE
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
 * /v1/upload:
 *   post:
 *     summary: Upload images
 *     description: Upload images to the server.
 *     parameters:
 *       - name: data_private
 *         in: query
 *         required: false
 *         description: Specifies if the data should be private.
 *         schema:
 *           type: string
 *           enum: [true, false]
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
uploadV1Router.all(
  uploadV1Paths.upload,
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
          (file) => `${apiUrl(req)}${imagesV1Paths.images}/${file.filename}`
        )}] (${reqUrl(req)})`
      );
    });

    return res.success({
      context: {
        imageUrls: (req.files as Array<Express.Multer.File>).map(
          (file) => `${apiUrl(req)}${imagesV1Paths.images}/${file.filename}`
        )
      },
      message: "File Uploaded Successfully"
    });
  }
);

const uploadDeleteSchema = z.object({
  imageUrls: z.array(z.string().url())
});

/**
 * @openapi
 * /v1/upload/delete:
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
uploadV1Router.all(
  uploadV1Paths.delete,
  request(["DELETE"], "application/json", uploadDeleteSchema),
  (req, res) => {
    const { imageUrls } = req.body as z.infer<typeof uploadDeleteSchema>;

    let alreadyDeleted = true;
    const deletedUrls: Array<string> = [];

    try {
      imageUrls.forEach((imageUrl) => {
        const imagePath = path.resolve(
          config.NODE_UPLOAD_DIR,
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
 * /v1/upload/delete/private:
 *   delete:
 *     summary: Remove uploaded private images
 *     description: Removes all images which has been uploaded with data_private=true query parameter.
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
uploadV1Router.all(uploadV1Paths.deletePrivate, request(["DELETE"]), (req, res) => {
  try {
    const files = fs.readdirSync(path.resolve(config.NODE_UPLOAD_DIR));

    files
      .filter((item) => item.startsWith("_"))
      .forEach((fileName) => {
        const filePath = path.join(config.NODE_UPLOAD_DIR, fileName);

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
uploadV1Router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError || err instanceof UploadError) {
    if ((err as MulterError).code === "LIMIT_FILE_SIZE") {
      logger.warn(`${err.message} [${reqUrl(req)}]`);

      return res.tooLarge({
        context: {
          message: err.message,
          maxFileSize: `${config.NODE_UPLOAD_SIZE / 1000} kB`
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

export { uploadV1Router, uploadV1Paths };
