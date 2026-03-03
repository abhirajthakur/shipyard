import { env } from "#app/config/env.js";
import { DeploymentStatus } from "@shipyard/types";

export async function updateStatus(
  id: string,
  status: DeploymentStatus,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 1000); // 10s timeout

  try {
    const response = await fetch(
      `${env.API_URL}/api/deployments/internal/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": env.INTERNAL_SECRET,
        },
        body: JSON.stringify({ status }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "unknown error");
      throw new Error(
        `Failed to update deployment ${id}: ${response.status} ${response.statusText} - ${text}`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`updateStatus timeout for deployment ${id}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
