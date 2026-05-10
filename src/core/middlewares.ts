import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from "hono";
import type { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";

import { resolveRequestOrigin } from "@/core/helpers.ts";
import {
  errorResponse,
  methodNotAllowedResponse,
  notFoundResponse
} from "@/core/responses.ts";
import { docsRouter } from "@/core/routers.ts";
import type { generalResponseSchema } from "@/core/schemas.ts";
import { resolveMatchesRoute } from "@/utils.ts";

import { honoLog } from "/logger.ts";

/** Helper middlewares */
const docsMiddleware = (hono: Hono): MiddlewareHandler =>
  async function docs(ctx, next) {
    await next();

    const { status, headers } = ctx.res;
    const requestOrigin = resolveRequestOrigin(ctx.req);

    if (!headers.get("content-type")?.includes("application/json")) return;

    const originalBody = (await ctx.res.json()) as Record<string, unknown>;
    const newHeaders = new Headers(headers);

    newHeaders.delete("content-length");

    const newBody: z.infer<typeof generalResponseSchema> = {
      ...(originalBody as z.infer<typeof generalResponseSchema>),
      context: {
        ...(originalBody.context as Record<string, unknown>),
        docs: {
          openapi: new URL(
            hono.routes.find((route) => route.path.includes(docsRouter.paths.openapi))
              ?.path ?? "",
            requestOrigin
          ).toString(),
          scalar: new URL(
            hono.routes.find((route) => route.path.includes(docsRouter.paths.docs))
              ?.path ?? "",
            requestOrigin
          ).toString()
        }
      }
    };

    ctx.res = new Response(JSON.stringify(newBody), { status, headers: newHeaders });
  };

const methodNotAllowedMiddleware = (hono: Hono): MiddlewareHandler =>
  async function methodNotAllowed(c, next) {
    const allowedMethods = [
      ...new Set(
        hono.routes
          .filter(
            (route) =>
              route.method !== "ALL" && resolveMatchesRoute(route.path, c.req.path)
          )
          .map((route) => route.method.toUpperCase())
          .filter((method) => method !== c.req.method.toUpperCase())
      )
    ];

    if (allowedMethods.length > 0) {
      return methodNotAllowedResponse({
        message: `Method '${c.req.method.toUpperCase()}' is not allowed for path '${c.req.path}'`,
        allowed_methods: allowedMethods
      });
    }

    await next();
  };

/** Error middlewares */
const notFoundMiddleware: NotFoundHandler = (c) => {
  honoLog.warn(`Path not found: ${c.req.method} ${c.req.path}`);

  return notFoundResponse({
    message: `Path '${c.req.path}' not found for '${c.req.method.toUpperCase()}' request method`
  });
};

const errorMiddleware: ErrorHandler = (err) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  honoLog.error(err, "Unhandled error");

  return errorResponse({ message: err.message });
};

export {
  docsMiddleware,
  methodNotAllowedMiddleware,
  notFoundMiddleware,
  errorMiddleware
};
