import crypto from "node:crypto";
import { config } from "../config.js";

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Compara sempre um par do mesmo tamanho pra não vazar o tamanho real via timing.
  const paddedB = bufA.length === bufB.length ? bufB : crypto.randomBytes(bufA.length);
  const match = crypto.timingSafeEqual(bufA, paddedB);
  return match && bufA.length === bufB.length;
}

// Basic Auth compartilhada pra toda a aplicação (front + API).
// Se AUTH_USER/AUTH_PASS não estiverem setados, fica aberta (mesmo padrão do API_TOKEN).
export function basicAuth(req, res, next) {
  if (!config.authUser || !config.authPass) return next();

  const header = req.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    const user = sep === -1 ? decoded : decoded.slice(0, sep);
    const pass = sep === -1 ? "" : decoded.slice(sep + 1);
    if (safeEqual(user, config.authUser) && safeEqual(pass, config.authPass)) {
      return next();
    }
  }

  res.set("WWW-Authenticate", 'Basic realm="Try-On Words", charset="UTF-8"');
  return res.status(401).send("Autenticação necessária.");
}
