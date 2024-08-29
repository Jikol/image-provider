import { Request } from "express";
import * as process from "node:process";
import path from "path";

const reqUrl = (req: Request): string => {
  return new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`).toString();
};

const apiUrl = (req: Request): string => {
  return new URL(`${req.protocol}://${req.get("host")}`).toString();
};

const resolvePath = (filePath: string | undefined): string | undefined => {
  if (!filePath) return undefined;
  const pathArray = filePath.split("");

  if (pathArray[0] === "." || pathArray[0] !== "/") {
    return path.resolve(process.cwd(), filePath);
  } else {
    return path.resolve(filePath);
  }
};

export { reqUrl, apiUrl, resolvePath };
