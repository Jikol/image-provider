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
  NODE_ENV: z
    .union([z.literal("development"), z.literal("production")])
    .default("production"),
  IMAGE_PROVIDER_DEBUG: z
    .string()
    .default("false")
    .transform((debug) => debug === "true"),
  IMAGE_PROVIDER_PORT: z.string().transform((port) => +port),
  IMAGE_PROVIDER_UPLOAD_PATH: z
    .string()
    .default("/tmp/image_provider")
    .transform((path) => resolvePath(path) as string),
  IMAGE_PROVIDER_UPLOAD_SIZE: z
    .string()
    .default("100")
    .transform((size) => parseInt(size) * 1000000)
});

const parseResult = configSchema.safeParse(
  Object.entries(process.env).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value === "" ? undefined : value }),
    {}
  )
);

if (!parseResult.success) {
  throw new Error(parseResult.error.message);
}

export default parseResult.data as z.infer<typeof configSchema>;
