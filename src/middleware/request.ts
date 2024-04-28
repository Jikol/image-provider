import type { NextFunction, Request, Response } from "express";

const request = (methods: Array<THttpMethod>, contentType: string) => {
  return (req: Request, res: Response, next: NextFunction): Response | undefined => {
    if (!methods.includes(req.method as THttpMethod)) {
      return res.notAllowed({ context: { allowedMethods: methods } }) as Response;
    }
    if (!req.is(contentType)) {
      return res.unsupportedContentType({
        context: { allowedContentType: contentType }
      }) as Response;
    }

    next();
  };
};

export { request };
