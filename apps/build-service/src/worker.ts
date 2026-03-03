import { redisConnection } from "#app/config/redis.js";
import { updateStatus } from "#app/services/deploymentApi.js";
import { runDockerBuild } from "#app/services/docker.js";
import { uploadFolder } from "#app/services/storage.js";
import { Worker } from "bullmq";
import fs from "fs/promises";

import { type BuildJob, DeploymentStatus } from "@shipyard/types";

export const worker = new Worker<BuildJob>(
  "deployments",
  async (job) => {
    const { deploymentId } = job.data;

    let artifactPath: string | null = null;

    try {
      await updateStatus(deploymentId, DeploymentStatus.BUILDING);

      artifactPath = await runDockerBuild(job.data);
      await uploadFolder(artifactPath);

      await updateStatus(deploymentId, DeploymentStatus.SUCCESS);

      console.log("Deployment success:", deploymentId);
    } catch (error) {
      console.error("Worker error:", error);

      await updateStatus(deploymentId, DeploymentStatus.FAILED);

      throw error;
    } finally {
      if (artifactPath) {
        try {
          await fs.rm(artifactPath, {
            recursive: true,
            force: true,
          });
          console.log("Workspace cleaned:", artifactPath);
        } catch (cleanupError) {
          console.error("Cleanup failed:", cleanupError);
        }
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
  },
);
