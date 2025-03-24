import type { Request, Response } from "express";

import { docsPaths } from "@/router";
import { reqBaseUrl } from "@/utils";

import log from "/logger";

const notFound = (req: Request, res: Response): Response => {
  log.warn(`Path not found (${reqBaseUrl(req)})`);

  return res.notFound({
    message: `path ${req.path} not found for ${req.method} request method, consult docs`,
    context: {
      docs: {
        openapi: new URL(docsPaths.openapi, reqBaseUrl(req)).toString(),
        redoc: new URL(docsPaths.redoc, reqBaseUrl(req)).toString()
      }
    }
  }) as Response;
};

export { notFound };
