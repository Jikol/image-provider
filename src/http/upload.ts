import { sValidator } from "@hono/standard-validator";
import { describeRoute } from "hono-openapi";
import { validator } from "hono/validator";
import { readdir, unlink } from "node:fs/promises";
import path from "path";
import { v4 } from "uuid";
import { z } from "zod";

import { createDocs, createRouter, resolveRequestOrigin } from "@/core/helpers.ts";
import {
  badRequestResponse,
  errorResponse,
  methodNotAllowedResponse,
  notFoundResponse,
  successResponse,
  tooLargeResponse,
  unsupportedMediaTypeResponse
} from "@/core/responses.ts";
import { imagesRouterV1 } from "@/http/images.ts";

import config from "/config.ts";
import { honoLog } from "/logger.ts";

const uploadRouterV1 = createRouter(
  {
    upload: "upload",
    delete: "upload/delete",
    deleteInternal: "upload/delete/internal"
  } as const,
  "/v1"
);

const fileSchema = z
  .instanceof(File)
  .refine((v) => v.name != null && v.name.length > 0, "Provided file is empty");

const uploadSchema = z.object({
  file: z.union([fileSchema, z.array(fileSchema).min(1)])
});

const uploadQuerySchema = z.object({
  file_name: z.string().optional(),
  internal: z.enum(["true", "false"]).optional()
});

uploadRouterV1.post(
  uploadRouterV1.paths.upload,
  describeRoute({
    operationId: "postUpload",
    description: "Upload images to the server.",
    tags: ["Upload"],
    requestBody: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                oneOf: [
                  { type: "string", format: "binary" },
                  { type: "array", items: { type: "string", format: "binary" } }
                ]
              }
            }
          }
        }
      }
    }
  }),
  createDocs(
    methodNotAllowedResponse,
    successResponse,
    badRequestResponse,
    tooLargeResponse,
    unsupportedMediaTypeResponse,
    errorResponse
  ),
  validator("header", (value) => {
    if (!(value["content-type"] ?? "").includes("multipart/form-data")) {
      return unsupportedMediaTypeResponse({
        allowed_content_type: "multipart/form-data"
      });
    }
  }),
  sValidator("query", uploadQuerySchema, (result) => {
    if (!result.success) {
      const issue = result.error[0];
      const field = issue?.path?.join(".");
      const message = field
        ? `${field}: ${issue.message}`
        : (issue?.message ?? "Invalid query");

      return badRequestResponse({ message });
    }
  }),
  sValidator("form", uploadSchema, (result) => {
    if (!result.success) {
      const issue = result.error[0];
      const field = issue?.path?.join(".");
      const message = field
        ? `${field}: ${issue.message}`
        : (issue?.message ?? "Invalid request body");

      return badRequestResponse({ message, expectedFormId: "file" });
    }
  }),
  async (ctx) => {
    const { file } = ctx.req.valid("form");
    const files = Array.isArray(file) ? file : [file];

    const { file_name: fileName, internal } = ctx.req.valid("query");
    const isInternal = internal === "true";

    if (fileName && files.length > 1) {
      return badRequestResponse({
        message: "When defining a file name, only one file can be supplied"
      });
    }

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();

      if (
        !config.CONST.ALLOWED_EXT.test(ext) ||
        !config.CONST.ALLOWED_MIME.test(file.type)
      ) {
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
          : `${isInternal ? "_" : ""}${v4().substring(0, 9)}${Date.now()}${ext}`;

        await Bun.write(path.join(uploadPath, destName), file);

        imageUrls.push(
          new URL(
            `${config.CONST.API_BASE_PATH}${imagesRouterV1.base}/${imagesRouterV1.paths.images}/${destName}`,
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
          schema: {
            type: "object",
            required: ["imageUrls"],
            properties: {
              imageUrls: {
                type: "array",
                items: { type: "string", format: "uri" }
              }
            }
          }
        }
      }
    }
  }),
  createDocs(
    methodNotAllowedResponse,
    successResponse,
    badRequestResponse,
    notFoundResponse,
    unsupportedMediaTypeResponse,
    errorResponse
  ),
  validator("header", (value) => {
    if (!(value["content-type"] ?? "").includes("application/json")) {
      return unsupportedMediaTypeResponse({ allowed_content_type: "application/json" });
    }
  }),
  sValidator("json", deleteSchema, (result) => {
    if (!result.success) {
      const issue = result.error[0];
      const field = issue?.path?.join(".");
      const message = field
        ? `${field}: ${issue.message}`
        : (issue?.message ?? "Invalid request body");

      return badRequestResponse({ message });
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
      return notFoundResponse({ message: "Provided image URLs were not found" });
    }

    return successResponse({
      message: "Provided URLs has been deleted",
      removedImageUrls: deletedUrls
    });
  }
);

uploadRouterV1.delete(
  uploadRouterV1.paths.deleteInternal,
  describeRoute({
    operationId: "deleteUploadDeleteInternal",
    description: "Removes all images uploaded with internal=true.",
    tags: ["Upload"]
  }),
  createDocs(methodNotAllowedResponse, successResponse, notFoundResponse, errorResponse),
  async () => {
    let deleted = false;

    try {
      const files = await readdir(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH);

      for (const fileName of files.filter((f) => f.startsWith("_"))) {
        const filePath = path.join(config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH, fileName);

        if (await Bun.file(filePath).exists()) {
          await unlink(filePath);
          deleted = true;
        }
      }
    } catch (err) {
      honoLog.error(err);

      return errorResponse({ message: "Error while perform i/o operations" });
    }

    if (!deleted) {
      return notFoundResponse({ message: "No internal images found" });
    }

    return successResponse({ message: "All internal images has been deleted" });
  }
);

export { uploadRouterV1 };
