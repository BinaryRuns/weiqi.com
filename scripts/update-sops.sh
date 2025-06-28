#!/usr/bin/env bash
set -euo pipefail

# Allow globbing to expand to empty array
shopt -s nullglob

# Ensure encrypted file exists
if [ ! -f .env.enc ]; then
  echo "⚠️  .env.enc not found; cannot update recipients."
  exit 1
fi

# Collect public-key files
pub_keys=(keys/*.asc)
if [ ${#pub_keys[@]} -eq 0 ]; then
  echo "↩️  No public keys in keys/*.asc — nothing to do."
  exit 0
fi

# Rebuild .sops.yaml to match encrypted file
cat > .sops.yaml << 'EOF'
creation_rules:
  - path_regex: '(^|/)\.env(\.enc)?$'
    encrypted_regex: '^(?!#).*'
    pgp:
EOF

# Append each fingerprint to config
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
         | awk -F: '/^fpr:/ {print $10; exit}')
  echo "      - \"$fp\"" >> .sops.yaml
done

# Rotate the encrypted file to add any missing recipients
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
         | awk -F: '/^fpr:/ {print $10; exit}')
  echo "🔐 Rotating .env.enc to include recipient $fp"
  sops -i --rotate --add-pgp "$fp" .env.enc
done

echo "✅  .env.enc updated and configured for ${#pub_keys[@]} recipient(s)."
