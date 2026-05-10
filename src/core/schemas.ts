import { z } from "zod";

const generalResponseSchema = z.object({
  context: z.object({
    message: z.string().optional(),
    docs: z.object({ openapi: z.string(), scalar: z.string() }).optional()
  }),
  status_message: z.string(),
  status_code: z.number()
});

export { generalResponseSchema };
