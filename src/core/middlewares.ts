import type { NextFunction, Request, Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

import { docsPaths } from "@/core";
import { reqUrl } from "@/utils";

import log from "/logger";

const getDocs = (req: Request): Record<string, object> => ({
  docs: {
    openapi: new URL(docsPaths.openapi, reqUrl(req)).toString(),
    redoc: new URL(docsPaths.redoc, reqUrl(req)).toString()
  }
});

const baseResponse = (
  req: Request,
  res: Response,
  context: object | undefined,
  status_code: number,
  headers?: Record<string, string | Array<string>>
): Response => {
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  }

  return res
    .status(status_code)
    .json({
      context: { ...context, ...getDocs(req) },
      status_message: getReasonPhrase(status_code),
      status_code
    })
    .end();
};

const responseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.unsupportedContentType = ({ context, allowedContentType }): Response => {
    return baseResponse(req, res, context, StatusCodes.UNSUPPORTED_MEDIA_TYPE, {
      Accept: allowedContentType
    });
  };
  res.unsupportedMedia = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  };
  res.notAllowed = ({ context, allowedMethods }): Response => {
    return baseResponse(req, res, context, StatusCodes.METHOD_NOT_ALLOWED, {
      Allow: allowedMethods
    }).end();
  };
  res.tooLarge = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.REQUEST_TOO_LONG);
  };
  res.notFound = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.NOT_FOUND);
  };
  res.error = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.INTERNAL_SERVER_ERROR);
  };
  res.badRequest = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.BAD_REQUEST);
  };
  res.success = ({ context }): Response => {
    return baseResponse(req, res, context, StatusCodes.OK);
  };

  next();
};

const notFoundMiddleware = (req: Request, res: Response): Response => {
  log.warn(`Path not found (${reqUrl(req)})`);

  return res.notFound({
    context: {
      message: `Path '${req.path}' not found for '${req.method}' request method (consult docs)`
    }
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
