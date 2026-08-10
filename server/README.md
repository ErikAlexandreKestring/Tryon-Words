# server — backend do Léxico Try-On

API Node/Express que lê e grava o `category-keywords.json` no bucket S3.
As credenciais da AWS **nunca** ficam no código: o SDK usa a IAM role (produção)
ou o seu profile local (`aws configure`) para testar.

## Endpoints

```
GET    /keywords   → devolve o JSON atual do S3
PUT    /keywords   → valida e grava o JSON recebido no S3
GET    /health     → checagem simples (200)
```

## Pré-requisitos

- Node 20+ (usa `node --watch`)
- Um bucket S3 e uma forma de autenticar na AWS (role ou profile local)

## Configuração

```bash
cd server
cp .env.example .env
# edite .env com AWS_REGION, S3_BUCKET, S3_KEY, etc.
npm install
```

Variáveis (`.env`):

| Variável       | Descrição                                                        |
|----------------|------------------------------------------------------------------|
| `PORT`         | Porta do servidor (padrão 3001)                                  |
| `AWS_REGION`   | Região do bucket (ex.: `sa-east-1`)                              |
| `S3_BUCKET`    | Nome do bucket                                                    |
| `S3_KEY`       | Caminho do arquivo (ex.: `config/category-keywords.json`)        |
| `API_TOKEN`    | Se preenchido, exige `Authorization: Bearer <token>`. Vazio = aberto |
| `CORS_ORIGIN`  | Origem do frontend permitida (ex.: `http://localhost:5173`)      |
| `AUTH_USER`    | Usuário do login compartilhado (HTTP Basic Auth). Vazio = aberto |
| `AUTH_PASS`    | Senha do login compartilhado. Defina junto com `AUTH_USER`      |

## Credenciais da AWS (sem chaves no repo)

**Para testar localmente**, autentique sua máquina uma vez:

```bash
aws configure          # grava ~/.aws/credentials (fora do projeto)
# ou exporte na sua shell (não commite):
# export AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...  AWS_REGION=sa-east-1
```

**Em produção**, anexe uma IAM role à instância/serviço com esta policy
(troque o bucket e o caminho):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::SEU_BUCKET/config/category-keywords.json"
  }]
}
```

## Rodando

```bash
npm run dev     # desenvolvimento (reinicia ao salvar)
npm start       # produção
```

Teste rápido:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/keywords
```

## Ligando o frontend

No `web/.env`, aponte para este servidor:

```
VITE_PUBLISH_ENDPOINT=http://localhost:3001/keywords
VITE_API_TOKEN=          # só se você setou API_TOKEN no backend
```

## Deploy (resumo)

Roda em qualquer lugar que rode Node: EC2, ECS/Fargate, container, etc.
O importante é que o ambiente tenha a IAM role com a policy acima — aí o SDK
pega as credenciais sozinho, sem nenhuma chave no código.

### Login do time (Basic Auth) e servir o frontend junto

Defina `AUTH_USER` e `AUTH_PASS` no `.env` — o servidor passa a exigir login
(HTTP Basic Auth) em tudo, menos `/health`. Assim, quando `web/dist` existir
(rode `npm run build` dentro de `web/`), este mesmo servidor já serve o
frontend estático atrás do mesmo login, sem precisar de outro serviço:

```bash
cd web && npm run build && cd ../server
npm start
```

Abrir `http://localhost:3001` (ou o domínio do deploy) pede usuário/senha uma
vez no navegador; depois disso as chamadas à API já usam a mesma sessão.

## Deploy grátis: Render (API) + Vercel (frontend)

Aqui o front e a API ficam em domínios diferentes, então usamos a variante
"separada" (não a combinada acima). Ordem importa por causa do CORS:

1. **Suba a API no Render primeiro:**
   - New → Web Service → conecte este repositório.
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Variáveis de ambiente (Render → Environment): `AWS_REGION`, `S3_BUCKET`,
     `S3_KEY`, `AUTH_USER`, `AUTH_PASS`, e **`AWS_ACCESS_KEY_ID` /
     `AWS_SECRET_ACCESS_KEY`** (Render não tem IAM role como uma EC2 — sem
     isso o SDK não acha credencial nenhuma). `CORS_ORIGIN` deixe em branco
     por enquanto, você volta aqui depois do passo 2.
   - Deploy. Anote a URL gerada (ex.: `https://tryon-words-api.onrender.com`).

2. **Suba o frontend no Vercel:**
   - Add New → Project → mesmo repositório.
   - Root Directory: `web` (framework Vite é detectado sozinho).
   - Variáveis de ambiente (Vercel → Settings → Environment Variables):
     - `VITE_PUBLISH_ENDPOINT` = `https://SEU-APP.onrender.com/keywords` (a
       URL do passo 1)
     - `AUTH_USER` / `AUTH_PASS` = os mesmos do Render — protegem a própria
       tela do app via `web/middleware.js` (Edge Middleware, roda no servidor
       do Vercel, nunca entra no código público)
   - Deploy. Anote a URL gerada (ex.: `https://tryon-words.vercel.app`).

3. **Volte no Render** e preencha `CORS_ORIGIN` com a URL do Vercel do passo 2
   (sem barra no final). Isso reinicia o serviço automaticamente.

Pronto: abrir a URL do Vercel já pede login (tela protegida pelo Edge
Middleware) e o app conversa com a API do Render usando o mesmo usuário/senha.
