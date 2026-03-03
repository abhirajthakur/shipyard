CREATE TYPE "public"."deployment_status" AS ENUM('CREATED', 'QUEUED', 'BUILDING', 'UPLOADING', 'SUCCESS', 'FAILED');--> statement-breakpoint
ALTER TABLE "deployments" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "deployments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "deployments" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"public"."deployment_status";--> statement-breakpoint
ALTER TABLE "deployments" ALTER COLUMN "status" SET DATA TYPE "public"."deployment_status" USING "status"::"public"."deployment_status";--> statement-breakpoint
ALTER TABLE "deployments" DROP COLUMN "artifact_url";