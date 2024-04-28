import type { NextFunction, Request, Response } from "express";

import logger from "@/logger";

const error = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): Response => {
  next(err);

  logger.error(err);

  return res.error({
    context: {
      message: err.message
    }
  }) as Response;
};

export { error };
