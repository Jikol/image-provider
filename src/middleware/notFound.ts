import type { Request, Response } from "express";

import config from "@/config";
import { reqBaseUrl, reqUrl } from "@/helper";
import logger from "@/logger";

const notFound = (req: Request, res: Response): Response => {
  logger.warn(`Path not found [${reqUrl(req)}]`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method, consult docs`,
    context: {
      openapi: `${reqBaseUrl(req)}/docs`,
      redoc: `http://${config.REDOC_HOSTNAME}:${config.REDOC_PORT}`
    }
  }) as Response;
};

export { notFound };
