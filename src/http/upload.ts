import { sValidator } from "@hono/standard-validator";
import { describeRoute } from "hono-openapi";
import { readdir, unlink } from "node:fs/promises";
import type { OpenAPIV3_1 } from "openapi-types";
import path from "path";
import { v4 } from "uuid";
import { z } from "zod";

import { createDocs, createRouter, resolveRequestOrigin } from "@/core/helpers.ts";
import {
  badRequestResponse,
  errorResponse,
  methodNotAllowedResponse,
  successResponse,
  tooLargeResponse,
  unsupportedMediaTypeResponse
} from "@/core/responses.ts";

import config from "/config.ts";
import { honoLog } from "/logger.ts";

const uploadRouterV1 = createRouter(
  {
    upload: "upload",
    delete: "upload/delete",
    deletePrivate: "upload/delete/private"
  } as const,
  "/v1"
);

const ALLOWED_EXT = /\.(jpe?g|png|gif|webp)$/i;
const ALLOWED_MIME = /^image\/(jpeg|png|gif|webp)$/;

uploadRouterV1.post(
  uploadRouterV1.paths.upload,
  describeRoute({
    operationId: "postUpload",
    description: "Upload images to the server.",
    tags: ["Upload"]
  }),
  createDocs(
    methodNotAllowedResponse,
    successResponse,
    badRequestResponse,
    tooLargeResponse,
    unsupportedMediaTypeResponse,
    errorResponse
  ),
  async (ctx) => {
    const contentType = ctx.req.header("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return unsupportedMediaTypeResponse({
        allowed_content_type: "multipart/form-data"
      });
    }

    let formData: FormData;

    try {
      formData = await ctx.req.formData();
    } catch {
      return badRequestResponse({ message: "Invalid multipart body" });
    }

    const files = formData.getAll("file").filter((v): v is File => v instanceof File);

    if (files.length === 0) {
      return badRequestResponse({
        message: "Files have not been provided",
        expectedFormId: "file"
      });
    }

    const fileName = ctx.req.query("file_name");
    const dataPrivate = ctx.req.query("data_private") === "true";

    if (fileName && files.length > 1) {
      return badRequestResponse({
        message: "When defining a file name, only one file can be supplied"
      });
    }

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();

      if (!ALLOWED_EXT.test(ext) || !ALLOWED_MIME.test(file.type)) {
        return unsupportedMediaTypeResponse({
          message: "Uploaded file format is not supported",
          allowedMimeTypes: ["jpg", "png", "gif", "webp"],
          expectedFormId: "file"
        });
      }

      if (file.size > config.ENVS.IMAGE_PROVIDER_UPLOAD_SIZE) {
        return tooLargeResponse({
          message: "File too large",
          maxFileSize: `${config.ENVS.IMAGE_PROVIDER_UPLOAD_SIZE / 1000} kB`
        });
      }
    }

    const uploadPath = config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH;
    const origin = resolveRequestOrigin(ctx.req);
    const imageUrls: Array<string> = [];

    try {
      for (const file of files) {
        const ext = path.extname(file.name).toLowerCase();
        const destName = fileName
          ? `${fileName}${ext}`
          : `${dataPrivate ? "_" : ""}${v4().substring(0, 9)}${Date.now()}${ext}`;

        await Bun.write(path.join(uploadPath, destName), file);

        imageUrls.push(
          new URL(
            [config.CONST.API_BASE_PATH, "v1", "images", destName].join("/"),
            origin
          ).toString()
        );
      }
    } catch (err) {
      honoLog.error(err);

      return errorResponse({ message: "Error while perform i/o operations" });
    }

    honoLog.info(
      `[${files.map((f) => f.name).join(", ")}] uploaded to ${uploadPath} as [${imageUrls.join(", ")}] (${ctx.req.url})`
    );

    return successResponse({ message: "File Uploaded Successfully", imageUrls });
  }
);

const deleteSchema = z.object({
  imageUrls: z.array(z.url())
});

uploadRouterV1.delete(
  uploadRouterV1.paths.delete,
  describeRoute({
    operationId: "deleteUploadDelete",
    description: "Remove files from filesystem which were uploaded.",
    tags: ["Upload"],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: z.toJSONSchema(deleteSchema) as unknown as OpenAPIV3_1.SchemaObject
        }
      }
    }
  }),
  createDocs(
    methodNotAllowedResponse,
    successResponse,
    badRequestResponse,
    unsupportedMediaTypeResponse,
    errorResponse
  ),
  sValidator("json", deleteSchema, (result) => {
    if (!result.success) {
      return badRequestResponse({ message: "Invalid request body" });
    }
  }),
  async (ctx) => {
    const { imageUrls } = ctx.req.valid("json");
    let alreadyDeleted = true;
    const deletedUrls: Array<string> = [];

    try {
      for (const imageUrl of imageUrls) {
        const imagePath = path.join(
          config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH,
          imageUrl.substring(imageUrl.lastIndexOf("/") + 1)
        );

        if (await Bun.file(imagePath).exists()) {
          await unlink(imagePath);
          deletedUrls.push(imageUrl);
          alreadyDeleted = false;
        }
      }
    } catch (err) {
      honoLog.error(err);

      return errorResponse({ message: "Error while perform i/o operations" });
    }

    if (alreadyDeleted) {
      return successResponse({
        message: "Provided URLs has its file representation already deleted"
      });
    }

    return successResponse({
      message: "Provided URLs has been deleted",
      removedImageUrls: deletedUrls
    });
  }
);

uploadRouterV1.delete(
  uploadRouterV1.paths.deletePrivate,
  describeRoute({
    operationId: "deleteUploadDeletePrivate",
    description: "Removes all images uploaded with data_private=true.",
    tags: ["Upload"]
  }),
  createDocs(methodNotAllowedResponse, successResponse, errorResponse),
  async () => {
    try {
      const files = await readdir(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH);

      for (const fileName of files.filter((f) => f.startsWith("_"))) {
        const filePath = path.join(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH, fileName);

        if (await Bun.file(filePath).exists()) {
          await unlink(filePath);
        }
      }
    } catch (err) {
      honoLog.error(err);

      return errorResponse({ message: "Error while perform i/o operations" });
    }

    return successResponse({ message: "All private images has been deleted" });
  }
);

export { uploadRouterV1 };
