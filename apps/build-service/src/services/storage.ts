import { bucketName, s3Client } from "#app/config/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import pLimit from "p-limit";
import path from "path";

const CONCURRENCY_LIMIT = 10;

function getCacheControl(filePath: string) {
  if (filePath.endsWith(".html")) {
    return "no-cache";
  }

  return "public, max-age=31536000, immutable";
}

async function getAllFiles(dirPath: string): Promise<string[]> {
  const directoryEntries = await fs.promises.readdir(dirPath, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of directoryEntries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function uploadFile(
  filePath: string,
  baseFolder: string,
  workspaceId: string,
) {
  const fileStream = fs.createReadStream(filePath);
  const relativePath = path.relative(baseFolder, filePath).replace(/\\/g, "/");

  const s3Key = `${workspaceId}/${relativePath}`;
  const contentType = mime.lookup(filePath) || "application/octet-stream";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileStream,
    ContentType: contentType,
    CacheControl: getCacheControl(filePath),
  });

  await s3Client.send(command);

  console.log(`Uploaded: ${s3Key}`);
}

export async function uploadFolder(folderPath: string) {
  const files = await getAllFiles(folderPath);
  const workspaceId = path.basename(folderPath);

  const limit = pLimit(CONCURRENCY_LIMIT);

  await Promise.all(
    files.map((file) => limit(() => uploadFile(file, folderPath, workspaceId))),
  );

  console.log("Folder upload complete");
}
