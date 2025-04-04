import type { NextFunction, Request, Response } from "express";

import { docsPaths } from "@/core";
import { reqUrl } from "@/utils";

import log from "/logger";

const getDocs = (req: Request): Record<string, object> => ({
  docs: {
    openapi: new URL(docsPaths.openapi, reqUrl(req)).toString(),
    redoc: new URL(docsPaths.redoc, reqUrl(req)).toString()
  }
});

const responseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.unsupportedContentType = ({
    context,
    message = "Unsupported Content Type",
    code = 415
  }): Response => {
    return res
      .header("Accept", context.allowedContentType)
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.unsupportedMedia = ({
    context,
    message = "Unsupported Media Type",
    code = 415
  }): Response => {
    return res
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.notAllowed = ({
    context,
    message = "Method Not Allowed",
    code = 405
  }): Response => {
    return res
      .header("Allow", context.allowedMethods)
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.tooLarge = ({ context, message = "Content Too Large", code = 413 }): Response => {
    return res
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.notFound = ({ context, message = "Not Found", code = 404 }): Response => {
    return res
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.error = ({ context, message = "Internal Server Error", code = 500 }): Response => {
    return res
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.badRequest = ({ context, message = "Bad Request", code = 400 }): Response => {
    return res
      .status(code)
      .json({ context: { ...context, ...getDocs(req) }, message, code })
      .end();
  };
  res.success = ({ context, message = "Success", code = 200 }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };

  next();
};

const notFoundMiddleware = (req: Request, res: Response): Response => {
  log.warn(`Path not found (${reqUrl(req)})`);

  return res.notFound({
    message: `Path ${req.path} not found for ${req.method} request method, consult docs`
  }) as Response;
};

const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (res.headersSent) {
    next(err);
  }

  log.error(err);

  return res.error({
    context: {
      message: err.message
    }
  }) as Response;
};

export { responseMiddleware, notFoundMiddleware, errorMiddleware };
