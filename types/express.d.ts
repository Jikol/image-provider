declare global {
  namespace Express {
    type TResponseProps = {
      context?: {
        message?: string | Array<unknown> | Record<string, unknown>;
        docs?: Record<string, string>;
        [key: string]: unknown;
      };
      status_message?: string;
    };

    type TNotAllowedProps = TResponseProps & {
      allowedMethods: Array<THttpMethod>;
    };

    type TUnsupportedContentTypeProps = TResponseProps & {
      allowedContentType: string;
    };

    interface Response {
      success(props: TResponseProps): Response;
      unsupportedContentType(props: TUnsupportedContentTypeProps): Response;
      unsupportedMedia(props: TResponseProps): Response;
      notFound(props: TResponseProps): Response;
      notAllowed(props: TNotAllowedProps): Response;
      tooLarge(props: TResponseProps): Response;
      badRequest(props: TResponseProps): Response;
      error(props: TResponseProps): Response;
    }
  }
}

export {};
