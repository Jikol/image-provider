import type { NextFunction, Request, Response } from "express";

const response = (_req: Request, res: Response, next: NextFunction): void => {
  res.unsupportedContentType = ({
    context,
    message = "Unsupported Media Type",
    code = 415
  }): Response => {
    return res
      .header("Accept", context.allowedContentType)
      .status(code)
      .json({ context, message, code })
      .end();
  };
  res.unsupportedMedia = ({
    context = undefined,
    message = "Unsupported Media Type",
    code = 415
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.notAllowed = ({
    context,
    message = "Method Not Allowed",
    code = 405
  }): Response => {
    return res
      .header("Allow", context.allowedMethods)
      .status(code)
      .json({ context, message, code })
      .end();
  };
  res.tooLarge = ({
    context = undefined,
    message = "Content Too Large",
    code = 413
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.notFound = ({
    context = undefined,
    message = "Not Found",
    code = 404
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.error = ({
    context = undefined,
    message = "Internal Server Error",
    code = 500
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.badRequest = ({
    context = undefined,
    message = "Bad Request",
    code = 400
  }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };
  res.success = ({ context = undefined, message = "Success", code = 200 }): Response => {
    return res.status(code).json({ context, message, code }).end();
  };

  next();
};

export { response };
