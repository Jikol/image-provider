import type { NextFunction, Request, Response } from "express";

import log from "/logger";

const error = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): Response => {
  next(err);

  log.error(err);

  return res.error({
    context: {
      message: err.message
    }
  }) as Response;
};

export { error };
