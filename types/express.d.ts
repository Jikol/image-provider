type TResponseProps = {
  context?: unknown;
  code?: number;
  message?: string;
};

declare global {
  namespace Express {
    interface Response {
      success(props: TResponseProps): Response;
      unsupportedMedia(props: TResponseProps): Response;
    }
  }
}

export {};
