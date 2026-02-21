import { env } from "./env.js";

export const redisConnection = {
  url: env.REDIS_URL,
};
