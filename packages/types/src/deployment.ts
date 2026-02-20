export enum DeploymentStatus {
  CREATED = "CREATED",
  QUEUED = "QUEUED",
  BUILDING = "BUILDING",
  UPLOADING = "UPLOADING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export type Deployment = {
  id: string;
  repoUrl: string;
  buildCommand: string;
  outputDir: string;
  status: DeploymentStatus;
  artifactUrl?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
};
