import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("8001"),

  SUPABASE_S3_REGION: z.string(),
  SUPABASE_S3_ENDPOINT: z.string(),
  SUPABASE_S3_ACCESS_KEY_ID: z.string(),
  SUPABASE_S3_SECRET_ACCESS_KEY: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
