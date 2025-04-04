import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer, { MulterError } from "multer";
import type { Multer, StorageEngine } from "multer";
import path from "path";
import serveIndex from "serve-index";
import { v4 } from "uuid";
import { z } from "zod";

import { requestHandler } from "@/core";
import { UploadError, apiUrl, reqUrl } from "@/utils";

import config from "/config";
import log from "/logger";

const imagesV1Router: Router = express.Router();
const imagesV1Paths = {
  images: path.join("/v1", "images")
};

/**
 * @openapi
 * /api/v1/images:
 *   get:
 *     operationId: getImages
 *     summary: List uploaded images
 *     description: Retrieve images index listing from the server.
 *     responses:
 *       '200':
 *         description: Image listing retrieved successfully.
 *       '404':
 *         description: Image listing directory not found.
 * /api/v1/images/{imageName}:
 *   get:
 *     operationId: getImagesName
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
  express.static(config.IMAGE_PROVIDER_UPLOAD_PATH),
  serveIndex(config.IMAGE_PROVIDER_UPLOAD_PATH, {
    icons: true,
    view: "details"
  })
);

const uploadV1Router: Router = express.Router();
const uploadV1Paths = {
  upload: path.join("/v1", "upload"),
  delete: path.join("/v1", "upload", "delete"),
  deletePrivate: path.join("/v1", "upload", "delete", "private")
};

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb): void => {
    if (!fs.existsSync(config.IMAGE_PROVIDER_UPLOAD_PATH)) {
      fs.mkdirSync(config.IMAGE_PROVIDER_UPLOAD_PATH);
    }

    return cb(null, config.IMAGE_PROVIDER_UPLOAD_PATH);
  },
  filename: (req, file, cb): void => {
    const fileAppend = path.extname(file.originalname).toLowerCase();

    if (req.query?.file_name) {
      return cb(null, `${req.query.file_name}${fileAppend}`);
    }

    return cb(
      null,
      `${
        req.query?.data_private && req.query?.data_private === "true" ? "_" : ""
      }${v4().substring(0, 9)}${Date.now()}${fileAppend}`
    );
  }
});
const fileUpload: Multer = multer({
  storage,
  limits: {
    fileSize: config.IMAGE_PROVIDER_UPLOAD_SIZE
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
 * /api/v1/upload:
 *   post:
 *     operationId: postUpload
 *     summary: Upload images
 *     description: Upload images to the server.
 *     parameters:
 *       - name: data_private
 *         in: query
 *         required: false
 *         description: Specifies if the data should be private.
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - name: file_name
 *         in: query
 *         required: false
 *         description: Specifies the custom name of the data file.
 *         schema:
 *           type: string
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
 *                   - "https://{{HOST}}/api/v1/images/<imgId>.<imgExtension>"
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
  requestHandler(["POST"], "multipart/form-data"),
  fileUpload.array("file"),
  (req, res) => {
    if ((req.files as Array<Express.Multer.File>).length <= 0) {
      return res.badRequest({
        context: {
          message: "Files have not been provided"
        }
      });
    }

    if (req.query?.file_name && (req.files as Array<Express.Multer.File>).length > 1) {
      return res.badRequest({
        context: {
          message: "When defining a file name, only one file can be supplied"
        }
      });
    }

    (req.files as Array<Express.Multer.File>).forEach((file) => {
      log.info(
        `File ${file.originalname} uploaded to ${file.destination} as ${
          file.filename
        } as [${(req.files as Array<Express.Multer.File>).map((file) =>
          new URL(
            path.join(config.API_BASE_PATH, imagesV1Paths.images, file.filename),
            apiUrl(req)
          ).toString()
        )}] (${reqUrl(req)})`
      );
    });

    return res.success({
      context: {
        imageUrls: (req.files as Array<Express.Multer.File>).map((file) =>
          new URL(
            path.join(config.API_BASE_PATH, imagesV1Paths.images, file.filename),
            apiUrl(req)
          ).toString()
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
 * /api/v1/upload/delete:
 *   delete:
 *     operationId: deleteUploadDelete
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
 *                   - "https://{{HOST}}/api/v1/images/<imgId>.<imgExtension>"
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
  requestHandler(["DELETE"], "application/json", uploadDeleteSchema),
  (req, res) => {
    const { imageUrls } = req.body as z.infer<typeof uploadDeleteSchema>;

    let alreadyDeleted = true;
    const deletedUrls: Array<string> = [];

    try {
      imageUrls.forEach((imageUrl) => {
        const imagePath = path.resolve(
          config.IMAGE_PROVIDER_UPLOAD_PATH,
          imageUrl.substring(imageUrl.lastIndexOf("/") + 1)
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          deletedUrls.push(imageUrl);
          alreadyDeleted = false;
        }
      });
    } catch (err) {
      log.error(err);

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
 * /api/v1/upload/delete/private:
 *   delete:
 *     operationId: deleteUploadDeletePrivate
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
uploadV1Router.all(uploadV1Paths.deletePrivate, requestHandler(["DELETE"]), (_, res) => {
  try {
    const files = fs.readdirSync(path.resolve(config.IMAGE_PROVIDER_UPLOAD_PATH));

    files
      .filter((item) => item.startsWith("_"))
      .forEach((fileName) => {
        const filePath = path.join(config.IMAGE_PROVIDER_UPLOAD_PATH, fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
  } catch (err) {
    log.error(err);

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
      log.warn(`${err.message} [${reqUrl(req)}]`);

      return res.tooLarge({
        context: {
          message: err.message,
          maxFileSize: `${config.IMAGE_PROVIDER_UPLOAD_SIZE / 1000} kB`
        }
      });
    }
    if ((err as MulterError).code === "LIMIT_UNEXPECTED_FILE") {
      log.warn(`${err.message} [${reqUrl(req)}]`);

      return res.badRequest({
        context: {
          message: err.message,
          expectedFormId: "file"
        }
      });
    }
    if ((err as UploadError).code === "LIMIT_FILE_TYPE") {
      log.warn(`${err.message} [${reqUrl(req)}]`);

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

export { imagesV1Router, imagesV1Paths, uploadV1Router, uploadV1Paths };
