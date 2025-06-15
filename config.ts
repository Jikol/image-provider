import dotenv from "dotenv";
import path from "path";
import process from "process";
import { z } from "zod";

import { resolvePath } from "@/utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const constants = {
  ROOT_PATH: path.resolve(process.cwd()),
  API_BASE_PATH: "/api"
};

const configSchema = z.object({
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
    .default("/var/lib/image_provider")
    .transform((path) => resolvePath(path) as string),
  IMAGE_PROVIDER_UPLOAD_SIZE: z
    .string()
    .default("100")
    .transform((size) => parseInt(size) * 1000000),
  IMAGE_PROVIDER_SSL_CERT_PATH: z
    .string()
    .default("./config/ssl/selfsigned-cert.pem")
    .transform((path) => resolvePath(path) as string),
  IMAGE_PROVIDER_SSL_KEY_PATH: z
    .string()
    .default("./config/ssl/selfsigned-key.pem")
    .transform((path) => resolvePath(path) as string)
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

export default { CONST: constants, ENVS: parseResult.data } as {
  CONST: typeof constants;
  ENVS: z.infer<typeof configSchema>;
};
