import dotenv from "dotenv";
import path from "path";
import process from "process";

dotenv.config();

const config = {
  VERSION: process.env.NODE_VERSION ? process.env.NODE_VERSION : "latest",
  DEBUG: ((): boolean => {
    return process.env.NODE_DEBUG === "true";
  })(),
  DEV: ((): boolean => {
    if (process.env.NODE_ENV === "development") return true;
    if (process.env.NODE_ENV === "production") return false;

    return false;
  })(),
  HOSTNAME: process.env.NODE_HOSTNAME ? process.env.NODE_HOSTNAME : "localhost",
  PORT: process.env.NODE_PORT ? +process.env.NODE_PORT : 8000,
  UPLOAD_DIR: ((): string => {
    if (!process.env.NODE_UPLOAD_DIR) throw new Error("NODE_UPLOAD_DIR env is undefined");

    return path.resolve(process.env.NODE_UPLOAD_DIR);
  })(),
  UPLOAD_SIZE: process.env.NODE_UPLOAD_SIZE
    ? +process.env.NODE_UPLOAD_SIZE * 1000
    : 1000000,
  BASE_PATH: "/api",
  REDOC_PORT: process.env.NODE_REDOC_PORT ? +process.env.NODE_REDOC_PORT : 8080,
  REDOC_HOSTNAME: process.env.NODE_REDOC_HOSTNAME
    ? process.env.NODE_REDOC_HOSTNAME
    : "localhost"
};

export default config;
