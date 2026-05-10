import type { HonoRequest } from "hono";
import { Hono } from "hono";
import { type ResponsesWithResolver, describeRoute, resolver } from "hono-openapi";
import { getReasonPhrase } from "http-status-codes";
import type { z } from "zod";

import { generalResponseSchema } from "@/core/schemas.ts";

type TRouterWithPaths<T extends Record<string, string>> = Hono & { paths: T };

type TContext = Record<string, unknown>;

type TResponseFn<T = unknown> = {
  (context?: TContext): Response;
  readonly statusCode: number;
  readonly schema: z.ZodType<T>;
};

const createRouter = <T extends Record<string, string>>(
  paths: T,
  basePath?: string
): TRouterWithPaths<T> => Object.assign(new Hono().basePath(basePath ?? "/"), { paths });

const createJsonResponse = (
  statusCode: number,
  getHeaders?: (context?: TContext) => Record<string, string>
): TResponseFn => {
  return Object.assign(
    (context?: TContext): Response =>
      new Response(
        JSON.stringify({
          context: { ...context },
          status_message: getReasonPhrase(statusCode),
          status_code: statusCode
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json", ...getHeaders?.(context) }
        }
      ),
    { statusCode, schema: generalResponseSchema } as const
  ) as TResponseFn<z.infer<typeof generalResponseSchema>>;
};

const createDocs = (...fns: Array<TResponseFn>): ReturnType<typeof describeRoute> => {
  const responses: ResponsesWithResolver = {};

  for (const fn of fns) {
    responses[fn.statusCode] = {
      description: getReasonPhrase(fn.statusCode),
      content: { "application/json": { schema: resolver(fn.schema) } }
    };
  }

  return describeRoute({ responses });
};

const resolveRequestOrigin = (req: HonoRequest): string => {
  const url = new URL(req.url);
  const protocol =
    req.header("x-forwarded-proto")?.split(",")[0]?.trim() ??
    url.protocol.replace(/:$/, "");
  const host = req.header("x-forwarded-host")?.split(",")[0]?.trim() ?? url.host;

  return new URL(`${protocol}://${host}`).origin;
};

export { createRouter, createJsonResponse, createDocs, resolveRequestOrigin };
