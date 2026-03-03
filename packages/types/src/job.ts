export type BuildJob = {
  deploymentId: string;
  repoUrl: string;
  buildCommand: string;
  outputDir: string;
  attempt?: number;
};
