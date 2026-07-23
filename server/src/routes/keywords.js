import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getKeywords, putKeywords } from "../lib/s3.js";
import { validateKeywords } from "../lib/validate.js";

export const keywordsRouter = Router();

// Lê o JSON atual do S3
keywordsRouter.get("/keywords", auth, async (req, res) => {
  try {
    const data = await getKeywords();
    res.json(data);
  } catch (err) {
    if (err?.name === "NoSuchKey") {
      return res.status(404).json({ error: "Arquivo não encontrado no bucket." });
    }
    console.error("[GET /keywords]", err);
    res.status(500).json({ error: "Erro ao ler do S3." });
  }
});

// Valida e grava o JSON no S3
keywordsRouter.put("/keywords", auth, async (req, res) => {
  const problem = validateKeywords(req.body);
  if (problem) return res.status(400).json({ error: problem });
  try {
    const result = await putKeywords(req.body);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[PUT /keywords]", err);
    res.status(500).json({ error: "Erro ao gravar no S3." });
  }
});
