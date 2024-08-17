import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import log from "@/logger";
import { reqUrl } from "@/utils";

const request = (
  methods: Array<THttpMethod>,
  contentType?: THttpContentType,
  bodySchema?: ZodSchema
) => {
  return (req: Request, res: Response, next: NextFunction): Response | undefined => {
    if (!methods.includes(req.method as THttpMethod)) {
      log.warn(`Method not allowed [${reqUrl(req)}]`);

      return res.notAllowed({ context: { allowedMethods: methods } }) as Response;
    }
    if (contentType && !req.is(contentType)) {
      log.warn(
        `Invalid Content-Type: ${
          req.headers["content-type"]
        }, Expected Content-Type: ${contentType} [${reqUrl(req)}]`
      );

      return res.unsupportedContentType({
        context: { allowedContentType: contentType }
      }) as Response;
    }
    if (bodySchema && !bodySchema.safeParse(req.body).success) {
      log.warn(`Invalid request body [${reqUrl(req)}]`);

      return res.badRequest({
        context: {
          message: "Request body JSON schema is not valid",
          expectedSchema: zodToJsonSchema(bodySchema)
        }
      }) as Response;
    }

    next();
  };
};

export { request };
