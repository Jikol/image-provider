type TCode = "LIMIT_FILE_TYPE";

class UploadError extends Error {
  public code: TCode;

  constructor(message: string, code: TCode) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { UploadError };
