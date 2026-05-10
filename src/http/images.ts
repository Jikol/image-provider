import { describeRoute } from "hono-openapi";
import { serveStatic } from "hono/bun";
import { readdir } from "node:fs/promises";
import { createDocs, createRouter, resolveRequestOrigin } from "@/core/helpers.ts";
import {
  errorResponse,
  methodNotAllowedResponse,
  notFoundResponse,
  successResponse
} from "@/core/responses.ts";

import config from "/config.ts";
import { honoLog } from "/logger.ts";

const imagesRouterV1 = createRouter(
  {
    images: "images",
    imageByName: "images/:imageName"
  } as const,
  "/v1"
);

imagesRouterV1.get(
  imagesRouterV1.paths.images,
  describeRoute({
    operationId: "getImages",
    description: "Retrieve images index listing from the server.",
    tags: ["Images"]
  }),
  createDocs(successResponse, methodNotAllowedResponse, notFoundResponse, errorResponse),
  async (ctx) => {
    const uploadPath = config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH;

    let entries: Array<string>;

    try {
      entries = await readdir(uploadPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return notFoundResponse({ message: "Image listing directory not found" });
      }
      honoLog.error(err);

      return errorResponse({ message: "Error reading image directory" });
    }

    const origin = resolveRequestOrigin(ctx.req);

    const imageUrls = entries
      .filter((f) => !f.startsWith("."))
      .map((f) =>
        new URL([config.CONST.API_BASE_PATH, "v1", "images", f].join("/"), origin).toString()
      );

    return successResponse({ imageUrls });
  }
);

imagesRouterV1.get(
  imagesRouterV1.paths.imageByName,
  describeRoute({
    operationId: "getImagesName",
    description: "Retrieve a specific static image from the server by its name.",
    tags: ["Images"]
  }),
  createDocs(methodNotAllowedResponse, notFoundResponse),
  serveStatic({
    root: config.ENVS.IMAGE_PROVIDER_UPLOAD_PATH,
    rewriteRequestPath: (p) => {
      const file = p.replace(
        new RegExp(`^${config.CONST.API_BASE_PATH}/v1/images`),
        ""
      );

      return file.includes("..") ? "/" : file;
    },
    onNotFound: (_filePath, ctx) => {
      honoLog.warn(`Image not found: ${ctx.req.url}`);
    }
  }),
  () => notFoundResponse({ message: "Image not found" })
);

export { imagesRouterV1 };
