import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { reqUrl } from "@/utils";

import log from "/logger";

const requestHandler = (
  methods: Array<THttpMethod>,
  contentType?: THttpContentType,
  bodySchema?: ZodSchema
) => {
  return (req: Request, res: Response, next: NextFunction): Response | undefined => {
    log.info(`Endpoint accessed (${reqUrl(req)})`);
    if (!methods.includes(req.method as THttpMethod)) {
      log.warn(`Method not allowed [${reqUrl(req)}]`);

      return res.notAllowed({ allowedMethods: methods }) as Response;
    }
    if (contentType && !req.is(contentType)) {
      log.warn(
        `Invalid Content-Type: ${
          req.headers["content-type"]
        }, Expected Content-Type: ${contentType} [${reqUrl(req)}]`
      );

      return res.unsupportedContentType({
        allowedContentType: contentType
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

export { requestHandler };
