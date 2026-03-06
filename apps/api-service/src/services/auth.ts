import { env } from "#app/config/env.js";
import { db, users } from "@shipyard/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./user.js";

const jwtSecret = env.JWT_SECRET!;

export async function signupUser(email: string, password: string) {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function signinUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

  return token;
}
