import deploymentRouter from "#api/routes/deployment.js";
import express from "express";

const app: express.Express = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).send({
    status: "ok",
  });
});

app.use("/api/deployments", deploymentRouter);

export default app;
