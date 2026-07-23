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
