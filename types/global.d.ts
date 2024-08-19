declare global {
  type THttpMethod = "POST" | "GET" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  type THttpContentType = "multipart/form-data" | "application/json";
}

export {};
