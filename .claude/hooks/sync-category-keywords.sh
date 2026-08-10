#!/usr/bin/env bash
set -euo pipefail

TARGET="web/src/data/category-keywords.json"

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)"

case "$FILE_PATH" in
  *"$TARGET") ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# Não sobrescrever edições locais ainda não commitadas.
if ! git diff --quiet -- "$TARGET" || ! git diff --cached --quiet -- "$TARGET"; then
  echo '{"systemMessage":"category-keywords.json tem alterações locais não commitadas — sync com o S3 pulado para não sobrescrevê-las."}'
  exit 0
fi

if [ ! -f server/.env ]; then
  echo '{"systemMessage":"server/.env não encontrado — não foi possível sincronizar category-keywords.json com o S3."}'
  exit 0
fi

set -a
# shellcheck disable=SC1091
source server/.env
set +a

KEY="${S3_KEY:-config/category-keywords.json}"

if aws s3 cp "s3://${S3_BUCKET}/${KEY}" "$TARGET" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "{\"systemMessage\":\"category-keywords.json sincronizado com s3://${S3_BUCKET}/${KEY} antes da edição.\"}"
else
  echo '{"systemMessage":"Falha ao sincronizar category-keywords.json com o S3 (verifique credenciais/bucket)."}'
fi
