import dotenv from "dotenv";
import path from "path";
import process from "process";
import { z } from "zod";

import { resolvePath } from "@/utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const configSchema = z.object({
  // static constants
  ROOT_PATH: z.string().default(path.resolve(process.cwd())),
  API_BASE_PATH: z.string().default("/api"),
  // code envs
  NODE_DEBUG: z
    .string()
    .default("false")
    .transform((debug) => debug === "true"),
  NODE_PORT: z
    .string()
    .default("8000")
    .transform((port) => +port),
  NODE_UPLOAD_PATH: z
    .string()
    .default("data/upload")
    .transform((path) => resolvePath(path) as string),
  NODE_UPLOAD_SIZE: z
    .string()
    .default("100")
    .transform((size) => parseInt(size) * 1000),
  // external required envs
  REDOC_HOSTNAME: z.string(),
  REDOC_PORT: z.string().transform((port) => +port),
  // deployment envs
  VERSION: z.string().default("latest"),
  HOSTNAME: z.string().default("localhost")
});

const result = configSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    result.error.issues
      .map((item) => `Missing '${item.path[0]}' environment: ${item.message}`)
      .flat()
      .join(" \n")
  );
  process.exit(0);
}

const config = result.data as z.infer<typeof configSchema>;

export default config;
