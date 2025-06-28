#!/usr/bin/env bash
set -euo pipefail

# Enable nullglob so missing files result in an empty array\shopt -s nullglob

ENV_FILE=".env.enc"

# Exit early if encrypted file doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  No $ENV_FILE found; skipping recipient rotation."
  exit 0
fi

# Gather public key files
pub_keys=(keys/*.asc)
if [ ${#pub_keys[@]} -eq 0 ]; then
  echo "↩️  No public keys found in keys/*.asc — nothing to do."
  exit 0
fi

# Rotate recipients into the existing encrypted file
for pub in "${pub_keys[@]}"; do
  # Extract the full fingerprint
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
       | awk -F: '/^fpr:/ {print $10; exit}')
  if [ -z "$fp" ]; then
    echo "⚠️  Could not extract fingerprint from $pub; skipping."
    continue
  fi
  echo "🔐 Rotating $ENV_FILE: adding recipient $fp"
  # Use explicit dotenv format so SOPS doesn't try JSON
  sops --input-type dotenv --output-type dotenv -i --rotate --add-pgp "$fp" "$ENV_FILE"
done

echo "✅  Rotation complete: $ENV_FILE now accessible by ${#pub_keys[@]} recipient(s)."
