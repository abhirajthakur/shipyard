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
  const requestedPath = req.path === "/" ? "index.html" : req.path.slice(1);
  const key = `${workspaceId}/${requestedPath}`;

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    const contentType =
      mime.lookup(requestedPath) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);

    const stream = response.Body as Readable;

    stream.on("error", () => {
      res.status(500).end();
    });

    stream.pipe(res);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      err.name === "NoSuchKey"
    ) {
      return res.status(404).send({ error: "Resource not found" });
    }

    console.error("S3 error:", err);
    return res.status(500).send({
      error: "Failed to fetch resource from S3",
    });
  }
});

export default app;
