import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  repoUrl: text("repo_url").notNull(),
  buildCommand: text("build_command").notNull(),
  outputDir: text("output_dir").notNull(),
  status: text("status").notNull(),
  artifactUrl: text("artifact_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
