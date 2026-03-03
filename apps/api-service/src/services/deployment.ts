import { deploymentQueue } from "#app/config/redis.js";
import { db, deployments, eq } from "@shipyard/db";

import {
  DeploymentStatus,
  type BuildJob,
  type CreateDeploymentRequest,
  type CreateDeploymentResponse,
  type DeploymentResponse,
} from "@shipyard/types";

export async function createDeployment(
  payload: CreateDeploymentRequest,
): Promise<CreateDeploymentResponse> {
  try {
    const [deployment] = await db
      .insert(deployments)
      .values({
        repoUrl: payload.repoUrl,
        buildCommand: payload.buildCommand,
        outputDir: payload.outputDir,
        status: DeploymentStatus.QUEUED,
      })
      .returning();

    if (!deployment) {
      throw new Error("Failed to create deployment");
    }

    const id = deployment.id;

    const job: BuildJob = {
      deploymentId: id,
      repoUrl: payload.repoUrl,
      buildCommand: payload.buildCommand,
      outputDir: payload.outputDir,
    };

    await deploymentQueue.add("build", job, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });

    return {
      id,
      status: DeploymentStatus.QUEUED,
    };
  } catch (err: any) {
    console.error("Error in createDeployment:", err);
    throw err; // re-throw so route handler can return proper status
  }
}

export async function getDeploymentById(
  id: string,
): Promise<DeploymentResponse | null> {
  try {
    const result = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, id));

    if (!result.length) return null;

    return result[0] as DeploymentResponse;
  } catch (err: any) {
    console.error("Error in getDeploymentById:", err);
    throw err;
  }
}

export async function getAllDeployments(): Promise<DeploymentResponse[]> {
  try {
    const result = await db.select().from(deployments);
    return result as DeploymentResponse[];
  } catch (err: any) {
    console.error("Error in getAllDeployments:", err);
    throw err;
  }
}

/**
 * Update deployment status (called by build-service)
 */
export async function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
) {
  try {
    await db
      .update(deployments)
      .set({
        status,
      })
      .where(eq(deployments.id, id));
  } catch (err: any) {
    console.error("Error in updateDeploymentStatus:", err);
    throw err;
  }
}
