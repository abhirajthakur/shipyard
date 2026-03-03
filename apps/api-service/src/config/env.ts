import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  JWT_SECRET: z.string().default("secret"),
  INTERNAL_SECRET: z.string().default("secret"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
