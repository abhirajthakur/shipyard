import { GetObjectCommand } from "@aws-sdk/client-s3";
import express from "express";
import mime from "mime-types";
import { bucketName, s3Client } from "./config/s3Client.js";

import type { Readable } from "stream";

const app: express.Express = express();

// https://expressjs.com/en/guide/migrating-5.html#path-syntax
app.get("/{*splat}", async (req, res) => {
  const host = req.hostname;
  const workspaceId = host.split(".")[0];

  let requestedPath = req.path.replace(/^\/+/, "");
  if (!requestedPath) {
    requestedPath = "index.html";
  }

  /*
   * Some projects (e.g. Vite) may be built with a base path like:
   *
   *   export default defineConfig({
   *     base: '/Calculator/'
   *   })
   *
   * In that case, the browser requests assets like:
   *   {workspaceId}.localhost:8001/Calculator/assets/main.js
   *
   * However, our S3 storage structure is:
   *
   *   workspaceId/
   *    - index.html
   *      assets/
   *       - index.js
   *       - style.css
   *
   * Notice that the "Calculator" base path does not exist in S3.
   *
   * To handle this, we try multiple possible S3 keys:
   *   1. workspaceId/Calculator/assets/main.js  (original request path)
   *   2. workspaceId/assets/main.js             (first segment stripped)
   *
   * The server attempts each path until one exists in S3.
   * This allows projects with different base paths to work
   * without changing how files are stored in S3.
   * */

  const tryPaths: string[] = [`${workspaceId}/${requestedPath}`];

  // Strip first segment (e.g. "Calculator")
  const segments = requestedPath.split("/");
  if (segments.length > 1) {
    const strippedPath = segments.slice(1).join("/");
    tryPaths.push(`${workspaceId}/${strippedPath}`);
  }

  let response;

  for (const key of tryPaths) {
    try {
      response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
      break;
    } catch (err: any) {
      if (err.name !== "NoSuchKey") {
        console.error("S3 fetch error:", err);
        return res.status(500).json({ error: "S3 fetch failed" });
      }
    }
  }

  if (!response) {
    return res.status(404).json({ error: "Resource not found" });
  }

  const contentType = mime.lookup(requestedPath) || "application/octet-stream";

  res.setHeader("Content-Type", contentType);

  // optional caching for static assets
  if (requestedPath.startsWith("assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }

  const stream = response.Body as Readable;

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).end();
  });

  stream.pipe(res);
});

export default app;
