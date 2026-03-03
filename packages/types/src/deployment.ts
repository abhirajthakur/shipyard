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

export type DeploymentResponse = {
  id: string;
  repoUrl: string;
  buildCommand: string;
  outputDir: string;
  status: DeploymentStatus;
  createdAt: Date;
  updatedAt?: Date | null;
};
