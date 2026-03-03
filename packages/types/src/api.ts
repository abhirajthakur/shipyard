import { DeploymentStatus } from "./deployment.js";

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
