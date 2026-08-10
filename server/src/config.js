import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`\n[config] Faltando variável de ambiente obrigatória: ${name}`);
    console.error("Copie server/.env.example para server/.env e preencha.\n");
    process.exit(1);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT || 3001),
  region: required("AWS_REGION"),
  bucket: required("S3_BUCKET"),
  key: process.env.S3_KEY || "config/category-keywords.json",
  apiToken: process.env.API_TOKEN || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  authUser: process.env.AUTH_USER || "",
  authPass: process.env.AUTH_PASS || "",
};
