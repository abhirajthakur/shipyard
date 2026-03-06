import { env } from "#app/config/env.js";
import jwt from "jsonwebtoken";

import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

const jwtSecret = env.JWT_SECRET;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Read JWT from cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
