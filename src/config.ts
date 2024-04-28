import dotenv from "dotenv";
import path from "path";
import process from "process";

dotenv.config();

const config = {
  DEBUG: ((): boolean => {
    return process.env.NODE_DEBUG === "true";
  })(),
  PORT: process.env.NODE_PORT ? +process.env.NODE_PORT : 8000,
  UPLOAD_DIR: ((): string => {
    if (!process.env.NODE_UPLOAD_DIR) throw new Error("NODE_UPLOAD_DIR env is undefined");

    return path.resolve(process.env.NODE_UPLOAD_DIR);
  })(),
  UPLOAD_SIZE: process.env.NODE_UPLOAD_SIZE
    ? +process.env.NODE_UPLOAD_SIZE * 1000
    : 1000000
};

export default config;
