import type { NextFunction, Request, Response } from "express";

import { reqUrl } from "@/helper";
import logger from "@/logger";
import { upload } from "@/router";

const notFound = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  next(err);

  logger.warn(`Path not found [${reqUrl(req)}]`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method`,
    context: {
      availablePaths: upload.stack
        .map(({ route }) => {
          if (!route) return;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { stack, ...rest } = route;

          return rest;
        })
        .filter(Boolean)
    }
  }) as Response;
};

export { notFound };
