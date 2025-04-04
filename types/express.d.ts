declare global {
  namespace Express {
    type TResponseProps = {
      context?: Record<string, string | object>;
      code?: number;
      message?: string;
    };

    type TNotAllowedProps = TResponseProps & {
      context: {
        allowedMethods: Array<THttpMethod>;
      };
    };

    type TUnsupportedContentTypeProps = TResponseProps & {
      context: {
        allowedContentType: string;
      };
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
