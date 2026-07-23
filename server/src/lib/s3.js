import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config.js";

// Sem chaves aqui: o SDK resolve credenciais pela cadeia padrão
// (IAM role em produção; profile/env local para testar).
const s3 = new S3Client({ region: config.region });

export async function getKeywords() {
  const res = await s3.send(new GetObjectCommand({ Bucket: config.bucket, Key: config.key }));
  const text = await res.Body.transformToString();
  return JSON.parse(text);
}

export async function putKeywords(data) {
  const body = JSON.stringify(data, null, 2);
  await s3.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: config.key,
    Body: body,
    ContentType: "application/json",
    CacheControl: "no-cache",
  }));
  return { bytes: Buffer.byteLength(body) };
}
