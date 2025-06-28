#!/usr/bin/env bash
set -euo pipefail

# Allow "keys/*.asc" to expand to empty rather than literal\shopt -s nullglob

# If no plaintext .env but encrypted exists, decrypt it first\if [ ! -f .env ] && [ -f .env.enc ]; then
  echo "🔒 Decrypting existing .env.enc to .env"
  sops --input-type dotenv --output-type dotenv --decrypt .env.enc > .env
fi

# Collect all public-key files
pub_keys=(keys/*.asc)

# If none, skip
if [ ${#pub_keys[@]} -eq 0 ]; then
  echo "↩️  No public keys in keys/*.asc — skipping SOPS config rebuild."
  exit 0
fi

# Rebuild .sops.yaml
cat > .sops.yaml <<'EOF'
creation_rules:
  - path_regex: '(^|/)\.env$'
    encrypted_regex: '^(?!#).*'
    pgp:
EOF

# Append each fingerprint
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
         | awk -F: '/^fpr:/ {print $10; exit}')
  echo "      - \"$fp\"" >> .sops.yaml
done

# Re-encrypt .env into .env.enc
sops --input-type dotenv --output-type dotenv --encrypt .env > .env.enc

echo "✅  .sops.yaml and .env.enc regenerated for ${#pub_keys[@]} key(s)."
