import { config } from "../config.js";

// Se API_TOKEN não estiver setado, a API fica aberta.
// Se estiver, exige "Authorization: Bearer <token>".
export function auth(req, res, next) {
  if (!config.apiToken) return next();
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token && token === config.apiToken) return next();
  return res.status(401).json({ error: "Não autorizado." });
}
