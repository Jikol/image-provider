import { Scalar } from "@scalar/hono-api-reference";
import { describeRoute, openAPIRouteHandler } from "hono-openapi";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import path from "path";

import { createDocs, createRouter } from "@/core/helpers.ts";
import { methodNotAllowedResponse, successResponse } from "@/core/responses.ts";
import { imagesRouterV1 } from "@/http/images.ts";
import { uploadRouterV1 } from "@/http/upload.ts";

import config from "/config.ts";

/** General routers */
const routers = createRouter({}, config.CONST.API_BASE_PATH);

/** Versioned router */
const versionedRouter = createRouter({});

versionedRouter.route("/", imagesRouterV1);
versionedRouter.route("/", uploadRouterV1);

/** Info router */
const infoRouter = createRouter({
  health: "health"
} as const);

infoRouter.get(
  infoRouter.paths.health,
  describeRoute({
    operationId: "getApiHealth",
    description: "Returns 200 OK if the service is running.",
    tags: ["Info"]
  }),
  createDocs(successResponse),
  createDocs(methodNotAllowedResponse),
  () => successResponse({ message: "OK" })
);

/** Docs router */
const docsRouter = createRouter({
  openapi: "openapi.json",
  docs: "docs"
} as const);

docsRouter.get(
  docsRouter.paths.openapi,
  createDocs(methodNotAllowedResponse),
  openAPIRouteHandler(routers, {
    documentation: {
      info: {
        title: "Image Provider API",
        version: "0.1.0",
        description: ""
      },
      tags: [
        { name: "Info", description: "Service health and status." },
        { name: "Docs", description: "API documentation and interactive tools." },
        { name: "Images", description: "Static image retrieval and listing." },
        { name: "Upload", description: "Image upload and deletion." }
      ],
      paths: {
        [path.join(config.CONST.API_BASE_PATH, docsRouter.paths.openapi)]: {
          get: {
            operationId: "getApiOpenapiJson",
            tags: ["Docs"],
            description: "Returns the OpenAPI JSON specification for this API.",
            responses: {
              [StatusCodes.OK]: {
                description: getReasonPhrase(StatusCodes.OK),
                content: { "application/json": { schema: { type: "object" } } }
              },
              [StatusCodes.METHOD_NOT_ALLOWED]: {
                description: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED)
              }
            }
          }
        }
      }
    },
    includeEmptyPaths: true
  })
);

docsRouter.get(
  docsRouter.paths.docs,
  describeRoute({
    operationId: "getApiScalar",
    tags: ["Docs"],
    description: "Renders the Scalar interactive API documentation UI.",
    responses: {
      [StatusCodes.OK]: {
        description: getReasonPhrase(StatusCodes.OK),
        content: { "text/html": { schema: { type: "string" } } }
      }
    }
  }),
  createDocs(methodNotAllowedResponse),
  Scalar({
    pageTitle: "Supacat API",
    theme: "deepSpace",
    showDeveloperTools: "never",
    telemetry: false,
    hideClientButton: true,
    operationsSorter: "method",
    tagsSorter: "alpha",
    orderRequiredPropertiesFirst: true,
    url: docsRouter.paths.openapi
  })
);

/** Bind all routers */
routers.route("/", infoRouter);
routers.route("/", docsRouter);
routers.route("/", versionedRouter);

export { routers, docsRouter };
