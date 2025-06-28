#!/usr/bin/env bash
set -euo pipefail

# Allow "keys/*.asc" to expand to empty array instead of literal
shopt -s nullglob

# Check for the encrypted file
if [ ! -f .env.enc ]; then
  echo "⚠️  .env.enc not found; cannot update recipients."
  exit 1
fi

# Collect public-key files
pub_keys=(keys/*.asc)

# If none, exit
if [ ${#pub_keys[@]} -eq 0 ]; then
  echo "↩️  No public keys in keys/*.asc — nothing to do."
  exit 0
fi

# Import keys in show-only mode (for fingerprint extraction)
for pub in "${pub_keys[@]}"; do
  gpg --import-options show-only --import "$pub"
done

# Add each public key as a recipient to the encrypted file
for pub in "${pub_keys[@]}"; do
  fp=$(gpg --with-colons --import-options show-only --import "$pub" \
         | awk -F: '/^fpr:/ {print $10; exit}')
  echo "🔐 Adding PGP recipient $fp to .env.enc"
  sops -i --rotate --add-pgp "$fp" .env.enc
done

echo "✅  .env.enc updated with ${#pub_keys[@]} recipient(s)."
