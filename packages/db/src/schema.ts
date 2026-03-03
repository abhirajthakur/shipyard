import { DeploymentStatus } from "@shipyard/types";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

const nanoidAlphanumeric = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  12,
);

export const deploymentStatusEnum = pgEnum(
  "deployment_status",
  Object.values(DeploymentStatus) as [string, ...string[]],
);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const deployments = pgTable("deployments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoidAlphanumeric()),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repoUrl: text("repo_url").notNull(),
  buildCommand: text("build_command").notNull(),
  outputDir: text("output_dir").notNull(),
  status: deploymentStatusEnum("status")
    .notNull()
    .default(DeploymentStatus.CREATED),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
