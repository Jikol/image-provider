import type { Request } from "express";

const reqBaseUrl = (req: Request): string => {
  return new URL(`${req.get("host")}${req.originalUrl}`).toString();
};

const reqUrl = (req: Request): string => {
  return new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`).toString();
};

const apiUrl = (req: Request): string => {
  return new URL(`${req.protocol}://${req.get("host")}`).toString();
};

export { reqBaseUrl, reqUrl, apiUrl };
