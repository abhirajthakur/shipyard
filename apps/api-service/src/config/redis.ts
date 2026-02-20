import { Queue } from "bullmq";
import { env } from "./env.js";

export const deploymentQueue = new Queue("deployments", {
  connection: {
    url: env.REDIS_URL,
  },
});
