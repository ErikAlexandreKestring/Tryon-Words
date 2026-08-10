// Edge Middleware do Vercel: exige o mesmo login (Basic Auth) da API antes de
// servir qualquer página estática. Sem AUTH_USER/AUTH_PASS configurados no
// projeto Vercel, fica aberto (mesmo padrão do backend).
export const config = {
  matcher: "/((?!_vercel).*)",
};

// Edge Runtime não tem node:crypto — comparação manual em tempo constante
// (evita vazar o tamanho/conteúdo da senha via timing), no mesmo espírito
// do timingSafeEqual usado no backend.
function safeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export default function middleware(request) {
  const authUser = process.env.AUTH_USER;
  const authPass = process.env.AUTH_PASS;
  if (!authUser || !authPass) return;

  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    const user = sep === -1 ? decoded : decoded.slice(0, sep);
    const pass = sep === -1 ? "" : decoded.slice(sep + 1);
    if (safeEqual(user, authUser) && safeEqual(pass, authPass)) return;
  }

  return new Response("Autenticação necessária.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Try-On Words"' },
  });
}
