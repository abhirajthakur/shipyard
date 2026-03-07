import { deploymentQueue } from "#app/config/queue.js";
import { and, db, deployments, eq } from "@shipyard/db";

import {
  DeploymentStatus,
  type BuildJob,
  type CreateDeploymentRequest,
  type CreateDeploymentResponse,
  type Deployment,
} from "@shipyard/types";

function serializeDeployment(deployment: any): Deployment {
  return {
    ...deployment,
    createdAt: deployment.createdAt.toISOString(),
    updatedAt: deployment.updatedAt.toISOString(),
  };
}

export async function createDeployment(
  userId: string,
  payload: CreateDeploymentRequest,
): Promise<CreateDeploymentResponse> {
  try {
    const [deployment] = await db
      .insert(deployments)
      .values({
        userId,
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
      backoff: { type: "exponential", delay: 2000 },
    });

    return { id, status: DeploymentStatus.QUEUED };
  } catch (err: any) {
    console.error("Error in createDeployment:", err);
    throw err;
  }
}

export async function getDeploymentById(
  userId: string,
  id: string,
): Promise<Deployment | null> {
  try {
    const result = await db
      .select()
      .from(deployments)
      .where(and(eq(deployments.id, id), eq(deployments.userId, userId)));

    if (!result.length) return null;

    return serializeDeployment(result[0]);
  } catch (err: any) {
    console.error("Error in getDeploymentById:", err);
    throw err;
  }
}

export async function getAllDeployments(userId: string): Promise<Deployment[]> {
  try {
    const result = await db
      .select()
      .from(deployments)
      .where(eq(deployments.userId, userId));

    return result.map((deployment) => serializeDeployment(deployment));
  } catch (err: any) {
    console.error("Error in getAllDeployments:", err);
    throw err;
  }
}

/**
 * Update deployment status (used by build-service)
 */
export async function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
) {
  try {
    await db.update(deployments).set({ status }).where(eq(deployments.id, id));
  } catch (err: any) {
    console.error("Error in updateDeploymentStatus:", err);
    throw err;
  }
}
