import { deploymentQueue } from "#api/config/redis.js";
import { db, deployments, eq } from "@shipyard/db";

import {
  DeploymentStatus,
  type BuildJob,
  type CreateDeploymentRequest,
  type CreateDeploymentResponse,
  type DeploymentResponse,
} from "@shipyard/types";

async function validateGitHubRepo(repoUrl: string): Promise<boolean> {
  try {
    const match = repoUrl.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+?)(\.git)?\/?$/,
    );

    if (!match) {
      return false;
    }

    const owner = match[1];
    const repo = match[2];

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
    );

    // Repo does not exist
    if (response.status === 404) {
      return false;
    }

    // Any other failed response
    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function createDeployment(
  payload: CreateDeploymentRequest,
): Promise<CreateDeploymentResponse> {
  try {
    const isValidRepo = await validateGitHubRepo(payload.repoUrl);

    if (!isValidRepo) {
      throw new Error("Invalid, non-existent, or private GitHub repository");
    }

    console.log("HERELLLLL");

    const [deployment] = await db
      .insert(deployments)
      .values({
        repoUrl: payload.repoUrl,
        buildCommand: payload.buildCommand,
        outputDir: payload.outputDir,
        status: DeploymentStatus.QUEUED,
      })
      .returning();

    console.log("Deployment created:", deployment);

    if (!deployment) {
      throw new Error("Failed to create deployment");
    }

    const id = deployment.id;

    const job: BuildJob = {
      deploymentId: id,
      repoUrl: payload.repoUrl,
      buildCommand: payload.buildCommand,
      outputDir: payload.outputDir,
      artifactPrefix: `deployments/${id}/`,
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
  artifactUrl?: string,
) {
  try {
    await db
      .update(deployments)
      .set({
        status,
        artifactUrl: artifactUrl ?? null,
      })
      .where(eq(deployments.id, id));
  } catch (err: any) {
    console.error("Error in updateDeploymentStatus:", err);
    throw err;
  }
}
