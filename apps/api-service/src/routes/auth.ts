import { signinUser, signupUser } from "#app/services/auth.js";
import { Router } from "express";
import z from "zod";

import { env } from "#app/config/env.js";
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

    return res.status(201).json(result);
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

export default router;
