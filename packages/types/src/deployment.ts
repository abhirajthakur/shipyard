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
  createdAt: string;
  updatedAt?: string | null;
};

export type CreateDeploymentRequest = {
  repoUrl: string;
  buildCommand: string;
  outputDir: string;
};

export type CreateDeploymentResponse = {
  id: string;
  status: DeploymentStatus;
};

export type UpdateDeploymentStatusRequest = {
  status: DeploymentStatus;
};
