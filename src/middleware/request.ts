import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const request = (
  methods: Array<THttpMethod>,
  contentType: string,
  bodySchema?: z.ZodSchema
) => {
  return (req: Request, res: Response, next: NextFunction): Response | undefined => {
    if (!methods.includes(req.method as THttpMethod)) {
      return res.notAllowed({ context: { allowedMethods: methods } }) as Response;
    }
    if (!req.is(contentType)) {
      return res.unsupportedContentType({
        context: { allowedContentType: contentType }
      }) as Response;
    }
    if (bodySchema && !bodySchema.safeParse(req.body).success) {
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
