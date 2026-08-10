// Comunicação com o backend. Enquanto o backend não existe, VITE_PUBLISH_ENDPOINT
// fica vazio e isPublishConfigured() retorna false.

const ENDPOINT = import.meta.env.VITE_PUBLISH_ENDPOINT || "";

export function isPublishConfigured() {
  return Boolean(ENDPOINT);
}

// Grava o JSON no S3 (via backend). Lança erro em caso de falha.
export async function publishToS3(data) {
  if (!ENDPOINT) throw new Error("not-configured");
  const res = await fetch(ENDPOINT, {
    method: "PUT",
    credentials: "include", // reenvia o login (Basic Auth) mesmo com front/API em domínios diferentes
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    },
    body: JSON.stringify(data, null, 2),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json().catch(() => ({}));
}

export async function loadFromS3() {
  if (!ENDPOINT) throw new Error("not-configured");
  const res = await fetch(ENDPOINT, { method: "GET", credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
