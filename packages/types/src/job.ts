export type BuildJob = {
  deploymentId: string;
  repoUrl: string;
  buildCommand: string;
  outputDir: string;
  artifactPrefix: string;
  attempt?: number;
};
