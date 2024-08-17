import type { Request, Response } from "express";

import config from "@/config";
import log from "@/logger";
import { reqUrl } from "@/utils";

const notFound = (req: Request, res: Response): Response => {
  log.warn(`Path not found (${reqUrl(req)})`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method, consult docs`,
    context: {
      docs: {
        openapi: `${reqUrl(req)}docs`,
        redoc: `http://${config.REDOC_HOSTNAME}:${config.REDOC_PORT}`
      }
    }
  }) as Response;
};

export { notFound };
