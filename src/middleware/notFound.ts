import type { Request, Response } from "express";
import path from "path";

import config from "@/config";
import log from "@/logger";
import { docsPaths } from "@/router";
import { reqUrl } from "@/utils";

const notFound = (req: Request, res: Response): Response => {
  log.warn(`Path not found (${reqUrl(req)})`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method, consult docs`,
    context: {
      docs: {
        openapi: new URL(docsPaths.docs, reqUrl(req)).toString(),
        redoc: new URL(`http://${config.REDOC_HOSTNAME}:${config.REDOC_PORT}`).toString()
      }
    }
  }) as Response;
};

export { notFound };
