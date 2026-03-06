import { env } from "#app/config/env.js";
import { authMiddleware } from "#app/middleware/auth.js";
import {
  createDeployment,
  getAllDeployments,
  getDeploymentById,
  updateDeploymentStatus,
} from "#app/services/deployment.js";
import { validateGitHubRepo } from "#app/utils/validateGithub.js";
import { DeploymentStatus } from "@shipyard/types";
import { Router } from "express";
import z from "zod";

import type { Request, Response } from "express";

const router: Router = Router();

const createDeploymentSchema = z.object({
  repoUrl: z.url(),
  buildCommand: z.string().min(1),
  outputDir: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(DeploymentStatus),
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = createDeploymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    const { valid, error } = await validateGitHubRepo(parsed.data.repoUrl);
    if (!valid) {
      return res.status(400).json({ error });
    }

    const result = await createDeployment(req.userId!, parsed.data);

    return res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error,
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    console.error("Create deployment error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const deployments = await getAllDeployments(req.userId!);
    return res.json(deployments);
  } catch (error: any) {
    console.error("Get deployments error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deployment = await getDeploymentById(req.userId!, id);

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    return res.json(deployment);
  } catch (error: any) {
    console.error("Get deployment error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
});

/**
 * Internal Deployment Status Update
 */
router.patch("/internal/:id/status", async (req: Request, res: Response) => {
  try {
    const internalSecret = req.headers["x-internal-secret"];
    if (internalSecret !== env.INTERNAL_SECRET) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const id = req.params.id as string;
    const parsed = updateStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    await updateDeploymentStatus(id, parsed.data.status);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Update status error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
});

export default router;
