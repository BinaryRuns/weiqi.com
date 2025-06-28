#!/usr/bin/env bash
set -euo pipefail

# 1) allow “keys/*.asc” to expand to empty rather than literal
shopt -s nullglob

# 2) collect all public‐key files
pub_keys=(keys/*.asc)

# 3) if none found, exit cleanly (no-op)
if [ ${#pub_keys[@]} -eq 0 ]; then
  echo "↩️  No public keys in keys/*.asc — skipping SOPS config rebuild."
  exit 0
fi

# 4) rebuild .sops.yaml
cat > .sops.yaml <<'EOF'
creation_rules:
  - path_regex: '(^|/)\\.env$'
    encrypted_regex: '^(?!#).*'
    pgp:
EOF

# 5) extract each fingerprint and append
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
         | awk -F: '/^fpr:/ {print $10; exit}')
  echo "      - \"$fp\"" >> .sops.yaml
done

# 6) re-encrypt your .env into .env.enc
sops --input-type dotenv --output-type dotenv --encrypt .env > .env.enc

echo "✅  .sops.yaml and .env.enc regenerated for ${#pub_keys[@]} key(s)."
