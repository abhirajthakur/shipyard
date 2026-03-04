import { env } from "#app/config/env.js";
import authRouter from "#app/routes/auth.js";
import deploymentRouter from "#app/routes/deployment.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app: express.Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).send({
    status: "ok",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/deployments", deploymentRouter);

export default app;
