import { redisConnection } from "#app/config/redis.js";
import { updateStatus } from "#app/services/deploymentApi.js";
import { runDockerBuild } from "#app/services/docker.js";
import { uploadFolder } from "#app/services/storage.js";
import { Worker } from "bullmq";

import { type BuildJob, DeploymentStatus } from "@shipyard/types";

export const worker = new Worker<BuildJob>(
  "deployments",
  async (job) => {
    const { deploymentId } = job.data;

    try {
      await updateStatus(deploymentId, DeploymentStatus.BUILDING);

      const artifactPath = await runDockerBuild(job.data);
      const publicUrl = await uploadFolder(artifactPath);

      await updateStatus(deploymentId, DeploymentStatus.SUCCESS, publicUrl);

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
