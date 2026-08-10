import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { basicAuth } from "./middleware/basicAuth.js";
import { keywordsRouter } from "./routes/keywords.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.join(__dirname, "../../web/dist");

export function createApp() {
  const app = express();

  app.use(cors({
    origin: config.corsOrigin,
    methods: ["GET", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // necessário pro navegador reenviar o login (Basic Auth) entre origens diferentes
  }));

  // Livre para health check de infra (load balancer, etc.) — não expõe nada sensível.
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use(basicAuth);
  app.use(express.json({ limit: "5mb" }));
  app.use("/", keywordsRouter);

  // Serve o build do frontend (web/dist), se ele existir, atrás do mesmo login.
  // Em dev, o frontend roda separado via Vite e essa pasta não existe — nada muda.
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get("*", (req, res) => res.sendFile(path.join(FRONTEND_DIST, "index.html")));
  }

  return app;
}
