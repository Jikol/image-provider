import { Request } from "express";

const reqUrl = (req: Request): string => {
  return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
};

const reqBaseUrl = (req: Request): string => {
  return `${req.protocol}://${req.get("host")}${req.baseUrl}`;
};

export { reqUrl, reqBaseUrl };
