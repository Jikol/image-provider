import { Request } from "express";

import config from "@/config";

const reqUrl = (req: Request): string => {
  return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
};

const reqBaseUrl = (req: Request): string => {
  return `${req.protocol}://${req.get("host")}${config.BASE_PATH}`;
};

export { reqUrl, reqBaseUrl };
