import { Redis } from "ioredis";
import { env } from "./env.js";

export const redisConnection = {
  url: env.REDIS_URL,
};

export const redis = new Redis(env.REDIS_URL!);
