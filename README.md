# Try-On Words

Ferramenta interna da Sizebay para gerenciar as **palavras-chave de roupas** aceitas
pelo provador virtual (Try-On). Permite consultar, adicionar e remover palavras por
**idioma** (BR, ES, EN, IT) e **categoria** (`FULL_BODY`, `UPPER_BODY`, `LOWER_BODY`),
visualizar o `category-keywords.json` em tempo real e publicá-lo no S3.

## Estrutura

```
tryon-words/
├── web/       → frontend (Vite + React)
└── server/    → backend (API para ler/gravar no S3)
```

`web` e `server` são projetos independentes. Hoje o frontend funciona sozinho; o botão
"Publicar no S3" fica ativo assim que o `server` existir e o endpoint for configurado.

## Rodando o frontend

```bash
cd web
npm install
npm run dev
```
