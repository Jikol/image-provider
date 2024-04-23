import { NextFunction, Request, Response } from "express";

type TResponseMiddleware = (req: Request, res: Response, next: NextFunction) => void;
export const responseMiddleware: TResponseMiddleware = (_req, res, next) => {
  res.unsupportedMedia = ({
    context = {},
    message = "Unsupported media type",
    code = 415
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.success = ({ context = {}, message = "Success", code = 200 }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  next();
};
