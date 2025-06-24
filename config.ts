import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const constants = {
  ROOT_PATH: path.resolve(process.cwd()),
  API_BASE_PATH: "/api",
  DEVELOPMENT: process.env.NODE_ENV === "development"
} as const;

const environments = z.object({
  IMAGE_PROVIDER_DEBUG: z
    .string()
    .default("true")
    .transform((debug) => debug === "true"),
  IMAGE_PROVIDER_PORT: z
    .string()
    .default("8000")
    .transform((port) => +port),
  IMAGE_PROVIDER_UPLOAD_PATH: z
    .string()
    .default("/tmp/image_provider")
    .transform((_path) => path.resolve(_path)),
  IMAGE_PROVIDER_UPLOAD_SIZE: z
    .string()
    .default("1024")
    .transform((size) => parseInt(size) * 1000000),
  IMAGE_PROVIDER_SSL_CERT_PATH: z
    .string()
    .default("/etc/ssl/certs/selfsigned-cert.pem")
    .transform((_path) => path.resolve(_path)),
  IMAGE_PROVIDER_SSL_KEY_PATH: z
    .string()
    .default("/etc/ssl/private/selfsigned-key.pem")
    .transform((_path) => path.resolve(_path))
});

export const handleEnv = (
  envs: Record<string, string | undefined>
): z.infer<typeof environments> => {
  const parseResult = environments.safeParse(
    Object.entries(envs).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value === "" ? undefined : value }),
      {}
    )
  );

  if (!parseResult.success) {
    throw new Error(parseResult.error.message);
  }

  return parseResult.data;
};

export default { CONST: constants, ENVS: handleEnv(process.env) } as {
  CONST: typeof constants;
  ENVS: z.infer<typeof environments>;
};
