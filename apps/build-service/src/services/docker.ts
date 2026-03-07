import { redis } from "#app/config/redis.js";
import { DockerClient } from "@docker/node-sdk";
import fs from "fs/promises";
import path from "path";
import { Writable } from "stream";
import { fileURLToPath } from "url";

import type { BuildJob } from "@shipyard/types";

const BUILD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const docker = await DockerClient.fromDockerConfig();

export async function runDockerBuild(job: BuildJob) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Go up from currenr directory -> project root (build-service)
  const projectRoot = path.resolve(__dirname, "../../");
  const workspaceRoot = path.join(projectRoot, "outputs", job.deploymentId);

  // Create host workspace folder
  await fs.mkdir(workspaceRoot, { recursive: true });
  await fs.chmod(workspaceRoot, 0o777);

  const buildScript = `
  set -ex  # print commands as they run + exit on error
  git clone --depth=1 ${job.repoUrl} repo
  cd repo


  if [ -f pnpm-lock.yaml ]; then
    echo "Using pnpm"
    pnpm install --frozen-lockfile
  else
    echo "Using npm"
    npm ci
  fi

  ${job.buildCommand}

  # Copy only the final build output to mounted volume
  echo ${job.outputDir}
  cp -r ${job.outputDir}/* /workspace/

  rm -rf /workspace/repo 
`;

  const container = await docker.containerCreate({
    Image: "shipyard-build-runner:1.0",
    Cmd: ["sh", "-c", buildScript],
    WorkingDir: "/workspace",
    User: "runner",
    HostConfig: {
      Binds: [`${workspaceRoot}:/workspace:rw`],

      NetworkMode: "bridge",

      Memory: 2 * 1024 * 1024 * 1024,
      MemorySwap: 2 * 1024 * 1024 * 1024,
      PidsLimit: 256,
      NanoCpus: 1_000_000_000,

      AutoRemove: true,

      CapDrop: ["ALL"],
      SecurityOpt: ["no-new-privileges"],
    },
  });

  console.log("Docker container created successfully");

  const containerId = container.Id;
  const timeout = setTimeout(async () => {
    console.warn("Build timeout reached. Stopping container...");
    try {
      await docker.containerStop(containerId, { timeout: 5 }); // 5 sec grace
    } catch (e) {
      console.error("Failed to stop container:", e);
    }
  }, BUILD_TIMEOUT_MS);

  try {
    await docker.containerStart(containerId);

    await streamContainerLogs(containerId, job.deploymentId);

    const res = await docker.containerWait(containerId);

    if (res.StatusCode !== 0) {
      throw new Error(
        `Build failed with status code: ${res.StatusCode}${res.Error?.Message ? ` | Error: ${res.Error?.Message}` : ""}`,
      );
    }

    return workspaceRoot;
  } catch (err) {
    console.error("Build error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function streamContainerLogs(
  containerId: string,
  deploymentId: string,
) {
  const key = `logs:${deploymentId}`;

  const stdoutStream = new Writable({
    write(chunk, _encoding, callback) {
      const rawLogs: string = chunk.toString();
      const splitLogs = rawLogs.split("\n");
      const logs = splitLogs.filter((line) => line.trim() !== "");

      for (const log of logs) {
        process.stdout.write(log + "\n");

        redis.rpush(key, log);
        redis.ltrim(key, -1000, -1);
        redis.publish(key, log);
      }

      callback();
    },
  });

  const stderrStream = new Writable({
    write(chunk, _encoding, callback) {
      const rawLogs: string = chunk.toString();
      const splitLogs = rawLogs.split("\n");
      const logs = splitLogs.filter((line) => line.trim() !== "");

      for (const log of logs) {
        process.stdout.write(log + "\n");

        redis.rpush(key, log);
        redis.ltrim(key, -1000, -1);
        redis.publish(key, log);
      }

      callback();
    },
  });

  await docker.containerLogs(containerId, stdoutStream, stderrStream, {
    follow: true,
    stdout: true,
    stderr: true,
    timestamps: true,
    tail: "all",
  });
}
