import { StatusCodes } from "http-status-codes";

import { createJsonResponse } from "@/core/helpers.ts";

const successResponse = createJsonResponse(StatusCodes.OK);
const badRequestResponse = createJsonResponse(StatusCodes.BAD_REQUEST);
const unauthorizedResponse = createJsonResponse(StatusCodes.UNAUTHORIZED);
const notFoundResponse = createJsonResponse(StatusCodes.NOT_FOUND);
const tooLargeResponse = createJsonResponse(StatusCodes.REQUEST_TOO_LONG);
const unprocessableEntityResponse = createJsonResponse(StatusCodes.UNPROCESSABLE_ENTITY);
const errorResponse = createJsonResponse(StatusCodes.INTERNAL_SERVER_ERROR);

const methodNotAllowedResponse = createJsonResponse(
  StatusCodes.METHOD_NOT_ALLOWED,
  (ctx) => ({ Allow: (ctx?.allowed_methods as string[] | undefined)?.join(", ") ?? "" })
);

const unsupportedMediaTypeResponse = createJsonResponse(
  StatusCodes.UNSUPPORTED_MEDIA_TYPE,
  (ctx) => ({ Accept: (ctx?.allowed_content_type as string | undefined) ?? "" })
);

export {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  methodNotAllowedResponse,
  tooLargeResponse,
  unsupportedMediaTypeResponse,
  unprocessableEntityResponse,
  errorResponse
};
