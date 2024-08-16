import dotenv from "dotenv";
import path from "path";
import process from "process";
import { z } from "zod";

import { resolvePath } from "@/utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const configSchema = z.object({
  // envs with defaults
  NODE_VERSION: z.string().default("staging"),
  NODE_DEBUG: z
    .string()
    .default("false")
    .transform((debug) => debug === "true"),
  NODE_HOSTNAME: z.string().default("localhost"),
  NODE_PORT: z
    .string()
    .default("8000")
    .transform((port) => +port),
  NODE_UPLOAD_DIR: z
    .string()
    .default("data/upload")
    .transform((path) => resolvePath(path) as string),
  NODE_UPLOAD_SIZE: z
    .string()
    .default("100")
    .transform((size) => +size * 1000),
  // required envs
  NODE_REDOC_HOSTNAME: z.string(),
  NODE_REDOC_PORT: z.string().transform((port) => +port),
  // static constants
  SRC_PATH: z.string().default(path.resolve(__dirname)),
  BASE_PATH: z.string().default("/api")
});

const result = configSchema.safeParse({
  NODE_DEBUG: process.env.NODE_DEBUG,
  NODE_HOSTNAME: process.env.NODE_HOSTNAME,
  NODE_PORT: process.env.NODE_PORT,
  NODE_UPLOAD_DIR: process.env.NODE_UPLOAD_DIR,
  NODE_UPLOAD_SIZE: process.env.NODE_UPLOAD_SIZE,
  NODE_REDOC_HOSTNAME: process.env.NODE_REDOC_HOSTNAME,
  NODE_REDOC_PORT: process.env.NODE_REDOC_PORT
});

if (!result.success) {
  console.error(
    result.error.issues
      .map((item) => `missing '${item.path[0]}' environment: ${item.message}`)
      .flat()
      .join(" \n")
  );
  process.exit(0);
}

const config = result.data as z.infer<typeof configSchema>;

export default config;
