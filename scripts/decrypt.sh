#!/usr/bin/env bash
set -euo pipefail

# Decrypt each .env.enc → .env.dec
find . -type f -name ".env.enc" | while read -r ENC_ENV; do
  OUT="${ENC_ENV%.enc}.dec"
  echo "🔓 Decrypting $ENC_ENV → $OUT"
  sops --decrypt --input-type dotenv --output-type dotenv "$ENC_ENV" > "$OUT"
done

echo "✅ Decryption complete." 