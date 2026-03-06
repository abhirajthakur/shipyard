import { signinUser, signupUser } from "#app/services/auth.js";
import { Router } from "express";
import z from "zod";

import { env } from "#app/config/env.js";
import { authMiddleware } from "#app/middleware/auth.js";
import { getUserById } from "#app/services/user.js";
import type { User } from "@shipyard/types";
import type { Request, Response } from "express";

const router: Router = Router();

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    const result = await signupUser(parsed.data.email, parsed.data.password);

    return res.status(201).json(result as User);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(error),
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const parsed = signinSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(parsed.error),
      });
    }

    const token = await signinUser(parsed.data.email, parsed.data.password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: z.treeifyError(error),
      });
    }

    if (error instanceof Error) {
      return res.status(401).json({ error: error.message });
    }

    console.error("Signin error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ success: true });
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Me endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
