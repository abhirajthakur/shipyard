import { redisConnection } from "#app/config/redis.js";
import { updateStatus } from "#app/services/deploymentApi.js";
import { Worker } from "bullmq";

import { type BuildJob, DeploymentStatus } from "@shipyard/types";
import { runDockerBuild } from "./services/docker.js";

export const worker = new Worker<BuildJob>(
  "deployments",
  async (job) => {
    const { deploymentId } = job.data;

    console.log("Picked job:", deploymentId);

    try {
      await updateStatus(deploymentId, DeploymentStatus.BUILDING);

      const artifactPath = await runDockerBuild(job.data);

      await updateStatus(deploymentId, DeploymentStatus.SUCCESS, artifactPath);

      console.log("Deployment success:", deploymentId);
    } catch (error) {
      console.error("Worker error:", error);

      await updateStatus(deploymentId, DeploymentStatus.FAILED);

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
  },
);
