import type { Request, Response } from "express";

import config from "@/config";
import logger from "@/logger";
import { reqUrl } from "@/utils";

const notFound = (req: Request, res: Response): Response => {
  logger.warn(`Path not found (${reqUrl(req)})`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method, consult docs`,
    context: {
      docs: {
        openapi: `${reqUrl(req)}docs`,
        redoc: `http://${config.NODE_REDOC_HOSTNAME}:${config.NODE_REDOC_PORT}`
      }
    }
  }) as Response;
};

export { notFound };
