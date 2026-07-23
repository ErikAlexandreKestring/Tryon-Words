import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { keywordsRouter } from "./routes/keywords.js";

export function createApp() {
  const app = express();

  app.use(cors({
    origin: config.corsOrigin,
    methods: ["GET", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  app.use(express.json({ limit: "5mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/", keywordsRouter);

  return app;
}
