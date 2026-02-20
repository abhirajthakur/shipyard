import {
  createDeployment,
  getAllDeployments,
  getDeploymentById,
  updateDeploymentStatus,
} from "#api/services/deployment.js";
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
  artifactUrl: z.url().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createDeploymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    const result = await createDeployment(parsed.data);

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

router.get("/", async (_req: Request, res: Response) => {
  try {
    const deployments = await getAllDeployments();
    return res.json(deployments);
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    console.error("Get deployments error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const deployment = await getDeploymentById(id);

    if (!deployment) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    return res.json(deployment);
  } catch (error: any) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    console.error("Get deployment error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/internal/:id/status", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const parsed = updateStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    const { status, artifactUrl } = parsed.data;

    await updateDeploymentStatus(id, status, artifactUrl);

    return res.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(error),
      });
    }

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    console.error("Update status error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
